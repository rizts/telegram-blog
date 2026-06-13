import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramBot from 'node-telegram-bot-api';

// Mock DB client so it doesn't try to connect
vi.mock('../src/db/client', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock TelegramBot
vi.mock('node-telegram-bot-api', () => {
  return {
    default: class MockBot {
      startPolling() { return Promise.resolve(); }
      on() {}
      async getChat(chatId: string) { return {} as any; }
      processUpdate(update: any) {}
      deleteWebHook() { return Promise.resolve(true); }
      setWebHook() { return Promise.resolve(true); }
    }
  };
});

// Set environment variables for testing
process.env.BOT_TOKEN = 'test-bot-token';

// Import the fastify app after mocking
import { fastify } from '../src/index';

describe('POST /bot/:token', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('processes updates when correct token is supplied', async () => {
    const processUpdateSpy = vi.spyOn(TelegramBot.prototype, 'processUpdate').mockImplementation(() => {});

    const mockUpdate = { update_id: 12345, channel_post: { message_id: 999, text: 'Hello' } };

    const response = await fastify.inject({
      method: 'POST',
      url: '/bot/test-bot-token',
      payload: mockUpdate,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    expect(processUpdateSpy).toHaveBeenCalledWith(mockUpdate);
  });

  it('returns 401 when token is incorrect', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/bot/wrong-token',
      payload: {},
    });

    expect(response.statusCode).toBe(401);
  });
});
