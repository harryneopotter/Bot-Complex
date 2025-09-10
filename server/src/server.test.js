import request from 'supertest';
import { jest, describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const personas = JSON.parse(fs.readFileSync(path.join(__dirname, 'bots/registry.json'), 'utf-8'));

// Mock the vendors module
jest.unstable_mockModule('./vendors.js', () => ({
  requestChatStream: jest.fn(),
}));

// We need to dynamically import the modules after mocking
const { app, sessions } = await import('./server.js');
const { requestChatStream } = await import('./vendors.js');

describe('API Endpoints', () => {
  afterEach(() => {
    sessions.clear();
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe('GET /api/bots', () => {
    it('should return a list of bots', async () => {
      const res = await request(app).get('/api/bots');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('bots');
      const expectedBots = (personas || []).map(p => ({ id: p.id, name: p.name, opener: p.opener })).sort((a, b) => a.id - b.id);
      expect(res.body.bots).toEqual(expectedBots);
    });
  });

  describe('POST /api/chat', () => {
    it('should return a streamed response on success', async () => {
      // Arrange
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ value: Buffer.from('data: {"foo":"bar"}\n\n'), done: false })
          .mockResolvedValueOnce({ value: undefined, done: true }),
      };
      const mockStreamBody = {
        getReader: () => mockReader,
      };

      requestChatStream.mockResolvedValue({
        ok: true,
        body: mockStreamBody,
        status: 200,
        headers: {
          get: () => 'text/event-stream',
        },
      });

      // Act
      const res = await request(app)
        .post('/api/chat')
        .send({ botId: 1, messages: [{ role: 'user', content: 'hello' }] });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('data: {"foo":"bar"}');

      // Assert that the correct provider was called based on persona preference
      expect(requestChatStream).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({
          provider: 'chutes',
          model: 'Qwen/Qwen3-8B',
        })
      }));
    });

    it('should return 400 if botId is missing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ messages: [{ role: 'user', content: 'hello' }] });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: 'botId is required',
        requestId: expect.any(String),
      });
    });

    it('should return 404 if bot is not found', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ botId: 999, messages: [{ role: 'user', content: 'hello' }] });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({
        code: 'BOT_NOT_FOUND',
        message: 'Unknown botId: 999',
      });
    });

    it('should fall back to the next provider on failure', async () => {
      // Arrange
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ value: Buffer.from('data: {"foo":"bar"}\n\n'), done: false })
          .mockResolvedValueOnce({ value: undefined, done: true }),
      };
      const mockStreamBody = {
        getReader: () => mockReader,
      };

      requestChatStream
        .mockRejectedValueOnce(new Error('Provider 1 failed'))
        .mockResolvedValueOnce({
          ok: true,
          body: mockStreamBody,
          status: 200,
          headers: { get: () => 'text/event-stream' },
        });

      // Act: Use a bot without a specific preference to test the default ladder
      const res = await request(app)
        .post('/api/chat')
        .send({ botId: 10, messages: [{ role: 'user', content: 'hello' }] });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('data: {"foo":"bar"}');
      expect(requestChatStream).toHaveBeenCalledTimes(2);

      // Check that the first call was to the preferred provider for bot 10
      expect(requestChatStream).toHaveBeenNthCalledWith(1, expect.objectContaining({
        options: expect.objectContaining({ provider: 'groq', model: 'llama-3.1-8b-instant' })
      }));

      // Check that the second call was to the next provider in the standard ladder
      expect(requestChatStream).toHaveBeenNthCalledWith(2, expect.objectContaining({
        options: expect.objectContaining({ provider: 'together', model: 'exaone/instruct-32b' })
      }));
    });

    it('should send an error event if all providers fail', async () => {
      // Arrange
      requestChatStream.mockRejectedValue(new Error('All providers failed'));

      // Act
      const res = await request(app)
        .post('/api/chat')
        .send({ botId: 10, messages: [{ role: 'user', content: 'hello' }] });

      // Assert
      expect(res.statusCode).toEqual(200); // The connection itself is OK
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('event: error');
      expect(res.text).toContain('data: {"code":"UPSTREAM_ERROR"');
      expect(requestChatStream).toHaveBeenCalledTimes(3); // Standard ladder for bot 10 has 3 steps
    });

    it('should fall back on timeout', async () => {
        // Arrange
        const mockReader = {
            read: jest.fn()
            .mockResolvedValueOnce({ value: Buffer.from('data: {"foo":"bar"}\n\n'), done: false })
            .mockResolvedValueOnce({ value: undefined, done: true }),
        };
        const mockStreamBody = {
            getReader: () => mockReader,
        };

        requestChatStream
            .mockRejectedValueOnce(new Error('timeout'))
            .mockResolvedValueOnce({
            ok: true,
            body: mockStreamBody,
            status: 200,
            headers: { get: () => 'text/event-stream' },
            });

        // Act
        const res = await request(app)
            .post('/api/chat')
            .send({ botId: 10, messages: [{ role: 'user', content: 'hello' }] });

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(requestChatStream).toHaveBeenCalledTimes(2);
    });

    it('should use the persona-specific provider first', async () => {
      // Arrange
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ value: Buffer.from('data: {"foo":"bar"}\n\n'), done: false })
          .mockResolvedValueOnce({ value: undefined, done: true }),
      };
      const mockStreamBody = {
        getReader: () => mockReader,
      };

      requestChatStream.mockResolvedValue({
        ok: true,
        body: mockStreamBody,
        status: 200,
        headers: { get: () => 'text/event-stream' },
      });

      // Act
      await request(app)
        .post('/api/chat')
        .send({ botId: 14, messages: [{ role: 'user', content: 'hello' }] });

      // Assert
      expect(requestChatStream).toHaveBeenCalledTimes(1);
      expect(requestChatStream).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({
          provider: 'chutes',
          model: 'Qwen/Qwen3-8B',
        })
      }));
    });
  });
});
