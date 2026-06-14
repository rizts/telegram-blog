import TelegramBot from 'node-telegram-bot-api';
import { db } from '@/db/client';
import { posts, channelMetadata } from '@/db/schema';
import { parseMessage } from '@/utils/parser';
import { and, eq, not } from 'drizzle-orm';

// Get channel live status from database (stateless)
export async function getChannelLiveStatus(): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(channelMetadata)
      .where(eq(channelMetadata.key, 'live_status'))
      .limit(1);
    return result.length > 0 && result[0].value === 'true';
  } catch (err) {
    console.error('[sync] Error getting live status from DB:', err);
    return false;
  }
}

// Set channel live status in database
export async function setChannelLiveStatus(isLive: boolean) {
  try {
    await db
      .insert(channelMetadata)
      .values({
        key: 'live_status',
        value: isLive ? 'true' : 'false',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: channelMetadata.key,
        set: { value: isLive ? 'true' : 'false', updatedAt: new Date() },
      });
  } catch (err) {
    console.error('[sync] Error setting live status in DB:', err);
  }
}

// Initialize Telegram Bot with event listeners for processing updates
export function initBotWithListeners(): TelegramBot {
  const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });
  const channelId = process.env.CHANNEL_USERNAME!;

  if (!channelId) {
    console.warn('[sync] CHANNEL_USERNAME is not configured');
  }

  // 1. Listen for new channel posts (Auto-save)
  bot.on('channel_post', async (msg) => {
    if (!channelId) return;
    if (msg.chat.username !== channelId.replace('@', '')) return;

    if ((msg as any).video_chat_started) {
      console.log('[sync] Live Stream started!');
      await setChannelLiveStatus(true);
      return;
    }
    if ((msg as any).video_chat_ended) {
      console.log('[sync] Live Stream ended!');
      await setChannelLiveStatus(false);
      return;
    }

    const allowForwardSync = process.env.ALLOW_FORWARD_SYNC === 'true';
    if (allowForwardSync) return;

    const parsed = parseMessage(msg, channelId);
    if (!parsed.content && !parsed.mediaUrl) return; // Skip empty service messages
    await upsertPost(parsed);

    // Trigger immediate sticky/deletion sync on update
    try {
      await syncStickyAndDeletions(channelId);
    } catch (e) {
      console.error('[sync] Error running post-event check:', e);
    }
  });

  // 2. Listen for edited channel posts
  bot.on('edited_channel_post', async (msg) => {
    if (!channelId) return;
    const allowForwardSync = process.env.ALLOW_FORWARD_SYNC === 'true';
    if (allowForwardSync) return;

    if (msg.chat.username !== channelId.replace('@', '')) return;
    const parsed = parseMessage(msg, channelId);
    if (!parsed.content && !parsed.mediaUrl) return;
    await upsertPost(parsed);
  });

  // 3. Listen for messages forwarded to the bot's private chat (for history backfilling)
  bot.on('message', async (msg) => {
    if (!channelId) return;
    const allowForwardSync = process.env.ALLOW_FORWARD_SYNC === 'true';
    if (!allowForwardSync) return;

    const targetUsername = channelId.replace('@', '');
    if (msg.forward_from_chat && msg.forward_from_chat.username === targetUsername) {
      const parsed = parseMessage(msg, channelId);
      if (!parsed.content && !parsed.mediaUrl) return;
      await upsertPost(parsed);
    }
  });

  return bot;
}

// Process webhook update by routing it through bot listeners
export async function handleWebhookUpdate(update: any) {
  const bot = initBotWithListeners();
  try {
    await bot.processUpdate(update);
  } catch (err) {
    console.error('[sync] Error processing webhook update:', err);
  }
}

// Set up webhook URL in Telegram
export async function setupWebhook(webhookUrl: string) {
  const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });
  await bot.deleteWebHook();
  await bot.setWebHook(webhookUrl);
  console.log(`[sync] Telegram webhook registered at: ${webhookUrl}`);
}

// Sync pinned messages and deleted posts
export async function syncStickyAndDeletions(channelId: string) {
  const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });
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
      set: { content: post.content, tags: post.tags, updatedAt: new Date() },
    });
}
