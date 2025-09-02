import { fetch } from 'undici';

const PROVIDERS = {
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    header: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  together: {
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    keyEnv: 'TOGETHERAI_API_KEY',
    header: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  chutes: {
    endpoint: 'https://llm.chutes.ai/v1/chat/completions',
    keyEnv: 'CHUTES_API_KEY',
    header: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
};

export async function requestChatStream({ messages, options, signal }) {
  const { provider, model, temperature = 0.6, max_tokens = 700 } = options;
  const conf = PROVIDERS[provider];
  if (!conf) throw new Error(`Unknown provider: ${provider}`);
  const key = process.env[conf.keyEnv];
  if (!key) throw new Error(`Missing API key env: ${conf.keyEnv}`);

  // OpenAI-compatible body
  const body = {
    model,
    messages,
    temperature,
    max_tokens,
    stream: true,
  };

  const headers = {
    'Content-Type': 'application/json',
    ...conf.header(key),
  };

  return fetch(conf.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
    // Required for Node fetch streaming semantics
    duplex: 'half',
  });
}

