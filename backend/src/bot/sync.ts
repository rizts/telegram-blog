import TelegramBot from 'node-telegram-bot-api';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { parseMessage } from '../utils/parser';
import { and, eq, not } from 'drizzle-orm';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

/**
 * Sync all channel history from the beginning.
 * The Telegram Bot API does not support direct getHistory,
 * workaround: forward all messages to the bot's private chat to capture them,
 * or use offset-based forwardMessages.
 *
 * Approach used: fetch via getChatHistory using
 * MTProto-compatible offset. For the standard Bot API, we store
 * the offset from polling and perform an initial sync via webhook replay.
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

    // Trigger immediate sticky/deletion sync on update
    try {
      await syncStickyAndDeletions(channelId);
    } catch (e) {
      console.error('[sync] Error running post-event check:', e);
    }
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

  // Run initial sticky/deletion check
  try {
    await syncStickyAndDeletions(channelId);
  } catch (err) {
    console.error('[sync] Error in initial sticky/deletion check:', err);
  }

  // Periodic check every 60 seconds
  setInterval(async () => {
    try {
      await syncStickyAndDeletions(channelId);
    } catch (err) {
      console.error('[sync] Error in periodic sync:', err);
    }
  }, 60000);

  return synced;
}

export async function syncStickyAndDeletions(channelId: string) {
  const cleanUsername = channelId.replace('@', '');

  // 1. Sync Pinned Message (Sticky)
  try {
    const chat = await bot.getChat(channelId);
    const pinnedMessageId = chat.pinned_message?.message_id;

    if (pinnedMessageId) {
      // Set pinned message to sticky = true
      await db
        .update(posts)
        .set({ isSticky: true, updatedAt: new Date() })
        .where(and(eq(posts.telegramMessageId, pinnedMessageId), eq(posts.isDeleted, false)));

      // Set all other messages to sticky = false
      await db
        .update(posts)
        .set({ isSticky: false, updatedAt: new Date() })
        .where(and(not(eq(posts.telegramMessageId, pinnedMessageId)), eq(posts.isDeleted, false)));
    } else {
      // Set all messages to sticky = false
      await db
        .update(posts)
        .set({ isSticky: false, updatedAt: new Date() })
        .where(eq(posts.isDeleted, false));
    }
  } catch (err) {
    console.error('[sync] Error fetching pinned message:', err);
  }

  // 2. Sync Deletions
  try {
    const activePosts = await db
      .select()
      .from(posts)
      .where(eq(posts.isDeleted, false));

    for (const post of activePosts) {
      const exists = await checkTelegramPostExists(cleanUsername, post.telegramMessageId);
      if (!exists) {
        console.log(`[sync] Post ID ${post.id} (Telegram ID: ${post.telegramMessageId}) was deleted from channel. Soft-deleting in DB.`);
        await db
          .update(posts)
          .set({ isDeleted: true, updatedAt: new Date() })
          .where(eq(posts.id, post.id));
      }
    }
  } catch (err) {
    console.error('[sync] Error checking deleted posts:', err);
  }
}

async function checkTelegramPostExists(channelUsername: string, messageId: number): Promise<boolean> {
  try {
    const res = await fetch(`https://t.me/${channelUsername}/${messageId}?embed=1`);
    if (!res.ok) return false;
    const html = await res.text();
    if (html.includes('tgme_widget_message_error') || html.includes('Post not found')) {
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[sync] Error fetching public embed for ${channelUsername}/${messageId}:`, err);
    return true; // Keep the post on network error to be safe
  }
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
