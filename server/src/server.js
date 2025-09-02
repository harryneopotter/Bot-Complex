import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { requestChatStream } from './vendors.js';
import { composeMessages, getPersonaById } from './templates.js';
import personas from './bots/registry.json' assert { type: 'json' };

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// For Render mono-service hosting UI + API, set specific origins if needed.
app.use(cors({ origin: true, credentials: false }));

// Simple in-memory history store for beta; TTL per session.
const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60; // 1h

function upsertSession(sessionId, record) {
  const now = Date.now();
  const value = { ...record, updatedAt: now };
  sessions.set(sessionId, value);
}

function getSession(sessionId) {
  const v = sessions.get(sessionId);
  if (!v) return null;
  if (Date.now() - v.updatedAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return v;
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Bots catalog (minimal data for UI)
app.get('/api/bots', (_req, res) => {
  try {
    const list = (personas || []).map(p => ({ id: p.id, name: p.name, opener: p.opener })).sort((a,b)=>a.id-b.id);
    res.json({ bots: list });
  } catch (e) {
    res.status(500).json({ code: 'SERVER_ERROR', message: String(e?.message || e) });
  }
});

// Chat streaming endpoint (SSE-like passthrough of OpenAI-compatible streams)
app.post('/api/chat', async (req, res) => {
  const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
  const started = Date.now();
  try {
    const {
      sessionId = requestId,
      botId,
      messages = [],
      quality = 'standard', // 'standard' | 'high'
      providerHint,
      modelHint,
      temperature,
      max_tokens,
    } = req.body || {};

    if (!botId) {
      return res.status(400).json({ code: 'BAD_REQUEST', message: 'botId is required', requestId });
    }

    // Compose server-side messages from persona + user messages
    const persona = getPersonaById(botId);
    if (!persona) {
      return res.status(404).json({ code: 'BOT_NOT_FOUND', message: `Unknown botId: ${botId}` });
    }

    const previous = getSession(sessionId)?.history || [];
    const { composed, meta } = composeMessages(persona, previous, messages);

    // Provider ladder (aligned to free SKUs where possible)
    const ladders = {
      standard: [
        // Fast, capable baseline
        { provider: 'groq', model: 'llama-3.1-8b-instant' },
        // Together free instruct (per provided list)
        { provider: 'together', model: 'exaone/instruct-32b' },
        // Chutes free Qwen
        { provider: 'chutes', model: 'Qwen/Qwen3-8B' },
      ],
      high: [
        // High quality first
        { provider: 'groq', model: 'llama-3.3-70b-versatile' },
        // Together free large instruct
        { provider: 'together', model: 'meta-llama/llama-3-70b-instruct' },
        // Chutes larger Qwen
        { provider: 'chutes', model: 'Qwen/Qwen3-14B' },
        // Optional additional Together reasoning large
        { provider: 'together', model: 'deepseek-ai/deepseek-llm-70b' },
      ],
    };

    // Persona-specific preferred first step (invisible to UI)
    const PERSONA_PREFS = {
      // Mash‑Myth Smith — creative lore → Qwen preference
      1: {
        standard: { provider: 'chutes', model: 'Qwen/Qwen3-8B' },
        high: { provider: 'chutes', model: 'Qwen/Qwen3-14B' },
      },
      // Quantum Fortune Fish — concise formatted bullets → Llama
      10: {
        standard: { provider: 'groq', model: 'llama-3.1-8b-instant' },
        high: { provider: 'together', model: 'meta-llama/llama-3-70b-instruct' },
      },
      // Minimalist Bard — strict format → Llama
      12: {
        standard: { provider: 'groq', model: 'llama-3.1-8b-instant' },
        high: { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      },
      // Misheard Lyricist — wordplay → Qwen
      14: {
        standard: { provider: 'chutes', model: 'Qwen/Qwen3-8B' },
        high: { provider: 'chutes', model: 'Qwen/Qwen3-14B' },
      },
      // Polite Roaster — precise tone and structure → Llama
      15: {
        standard: { provider: 'groq', model: 'llama-3.1-8b-instant' },
        high: { provider: 'together', model: 'meta-llama/llama-3-70b-instruct' },
      },
    };

    const base = quality === 'high' ? ladders.high : ladders.standard;
    const ladder = [...base];

    // Helper to deduplicate provider/model steps
    const uniq = (arr) => {
      const seen = new Set();
      return arr.filter((s) => {
        const key = `${s.provider}|${s.model}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Apply explicit hints if provided; else apply persona preference if available
    if (providerHint || modelHint) {
      ladder.unshift({ provider: providerHint || 'groq', model: modelHint || ladder[0]?.model });
    } else {
      const pref = PERSONA_PREFS[persona.id]?.[quality];
      if (pref) ladder.unshift(pref);
    }
    // Deduplicate in case preferred step already exists
    while (ladder.length > 0 && ladder.length !== uniq(ladder).length) {
      ladder.splice(0, ladder.length, ...uniq(ladder));
    }

    // Prepare response headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let attempt = 0;
    let lastError = null;
    for (const step of ladder) {
      attempt += 1;
      const ctl = new AbortController();
      const timeout = setTimeout(() => ctl.abort('timeout'), 1000 * 30);
      try {
        const providerOpts = {
          provider: step.provider,
          model: step.model,
          temperature: temperature ?? (quality === 'high' ? 0.7 : 0.6),
          max_tokens: max_tokens ?? (quality === 'high' ? 900 : 700),
        };

        const streamResp = await requestChatStream({
          messages: composed,
          options: providerOpts,
          signal: ctl.signal,
        });

        if (!streamResp.ok) {
          const text = await streamResp.text().catch(() => '');
          throw new Error(`Upstream ${step.provider} ${step.model} ${streamResp.status}: ${text}`);
        }

        // Announce provider/model used
        res.write(`event: meta\n`);
        res.write(`data: ${JSON.stringify({ provider: step.provider, model: step.model, requestId })}\n\n`);

        // Pipe upstream SSE chunks to client as-is
        const reader = streamResp.body.getReader();
        // Keepalive ping
        let ping = setInterval(() => res.write(`: ping\n\n`), 15000);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) res.write(Buffer.from(value));
        }

        clearInterval(ping);
        clearTimeout(timeout);

        // Persist limited history server-side (chars cap)
        const MAX_HISTORY_CHARS = 8000;
        const newHistory = [...previous, ...messages];
        let total = 0;
        const trimmed = [];
        for (let i = newHistory.length - 1; i >= 0; i--) {
          const c = JSON.stringify(newHistory[i] ?? '');
          total += c.length;
          if (total <= MAX_HISTORY_CHARS) trimmed.unshift(newHistory[i]);
          else break;
        }
        upsertSession(sessionId, { history: trimmed });

        // Finish stream
        res.end();
        return;
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;
        // Backoff small before next provider
        await delay(200 * attempt);
        continue;
      }
    }

    // All attempts failed
    res.write(`event: error\n`);
    res.write(
      `data: ${JSON.stringify({ code: 'UPSTREAM_ERROR', message: String(lastError?.message || 'All providers failed'), requestId })}\n\n`
    );
    res.end();
  } catch (e) {
    res.status(500).json({ code: 'SERVER_ERROR', message: String(e?.message || e), requestId });
  } finally {
    const ms = Date.now() - started;
    // eslint-disable-next-line no-console
    console.log(`[${requestId}] ${ms}ms`);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`AI Mini-Arcade server listening on :${PORT}`);
});
