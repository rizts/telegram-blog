import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB
vi.mock('../src/db/client', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock Telegram Bot with prototype methods so we can spy on them
vi.mock('node-telegram-bot-api', () => {
  return {
    default: class MockBot {
      startPolling() { return Promise.resolve(); }
      on() {}
      async getChat(chatId: string) { return {} as any; }
    }
  };
});

import { db } from '../src/db/client';
import { syncStickyAndDeletions } from '../src/bot/sync';
import TelegramBot from 'node-telegram-bot-api';

function createQueryBuilder(resolveValue: any) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: (onfulfilled: any) => Promise.resolve(resolveValue).then(onfulfilled),
  };
}

describe('syncStickyAndDeletions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('updates sticky status of posts based on pinned message', async () => {
    const getChatSpy = vi.spyOn(TelegramBot.prototype, 'getChat').mockResolvedValue({
      id: 123,
      type: 'channel',
      pinned_message: {
        message_id: 555,
        date: 1700000000,
        chat: { id: 123, type: 'channel' }
      }
    } as any);

    vi.mocked(db.select).mockImplementationOnce(() => createQueryBuilder([]) as any);
    vi.mocked(db.update).mockImplementation(() => createQueryBuilder([]) as any);

    await syncStickyAndDeletions('@testchannel');

    expect(getChatSpy).toHaveBeenCalledWith('@testchannel');
    expect(db.update).toHaveBeenCalled();
  });

  it('soft-deletes posts that no longer exist on Telegram', async () => {
    vi.spyOn(TelegramBot.prototype, 'getChat').mockResolvedValue({
      id: 123,
      type: 'channel',
    } as any);

    const activePosts = [
      { id: 1, telegramMessageId: 101, isDeleted: false },
      { id: 2, telegramMessageId: 102, isDeleted: false }
    ];
    vi.mocked(db.select).mockImplementationOnce(() => createQueryBuilder(activePosts) as any);
    vi.mocked(db.update).mockImplementation(() => createQueryBuilder([]) as any);

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('101')) {
        return {
          ok: true,
          text: async () => 'tgme_widget_message_error Post not found'
        };
      }
      return {
        ok: true,
        text: async () => 'widget content exists'
      };
    }));

    await syncStickyAndDeletions('@testchannel');

    expect(db.update).toHaveBeenCalled();
  });
});
