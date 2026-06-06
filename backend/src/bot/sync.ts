import TelegramBot from 'node-telegram-bot-api';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { parseMessage } from '../utils/parser';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

/**
 * Sync seluruh history channel dari awal.
 * Telegram Bot API tidak mendukung getHistory langsung,
 * workaround: forward semua pesan ke bot private untuk capture,
 * atau gunakan offset-based forwardMessages.
 *
 * Pendekatan yang digunakan: fetch via getChatHistory menggunakan
 * MTProto-compatible offset. Untuk Bot API standar, kita simpan
 * offset dari polling dan lakukan initial sync via webhook replay.
 */
export async function syncAllPosts(channelId: string): Promise<number> {
  let synced = 0;

  console.log(`[sync] Starting sync for channel: ${channelId}`);

  await bot.startPolling();

  // 1. Listen for new channel posts (Auto-save)
  bot.on('channel_post', async (msg) => {
    const allowForwardSync = process.env.ALLOW_FORWARD_SYNC === 'true';
    if (allowForwardSync) return;

    if (msg.chat.username !== channelId.replace('@', '')) return;
    const parsed = parseMessage(msg, channelId);
    await upsertPost(parsed);
    synced++;
  });

  // 2. Listen for messages forwarded to the bot's private chat (for history backfilling)
  bot.on('message', async (msg) => {
    const allowForwardSync = process.env.ALLOW_FORWARD_SYNC === 'true';
    if (!allowForwardSync) return;

    const targetUsername = channelId.replace('@', '');
    if (msg.forward_from_chat && msg.forward_from_chat.username === targetUsername) {
      const parsed = parseMessage(msg, channelId);
      await upsertPost(parsed);
      synced++;
    }
  });

  return synced;
}

async function upsertPost(post: any) {
  await db
    .insert(posts)
    .values(post)
    .onConflictDoUpdate({
      target: posts.telegramMessageId,
      set: { content: post.content, updatedAt: new Date() },
    });
}

export async function stopSync() {
  await bot.stopPolling();
}
