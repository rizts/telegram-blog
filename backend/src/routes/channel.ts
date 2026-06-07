import type { FastifyPluginAsync } from 'fastify';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

const channelRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /channel/photo — proxy the channel's profile photo from Telegram CDN.
  // Returns 404 if the channel has no profile photo.
  fastify.get('/photo', async (request, reply) => {
    const channelId = process.env.CHANNEL_USERNAME;
    if (!channelId) {
      reply.status(503);
      return { error: 'CHANNEL_USERNAME is not configured' };
    }

    try {
      const chat = await bot.getChat(channelId);

      if (!chat.photo?.small_file_id) {
        reply.status(404);
        return { error: 'Channel has no profile photo' };
      }

      const fileInfo = await bot.getFile(chat.photo.big_file_id ?? chat.photo.small_file_id);
      if (!fileInfo.file_path) {
        reply.status(404);
        return { error: 'File path not available' };
      }

      const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
      const upstream = await fetch(telegramFileUrl);

      if (!upstream.ok) {
        reply.status(502);
        return { error: 'Failed to fetch photo from Telegram' };
      }

      const ext = fileInfo.file_path.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      reply.header('Content-Type', contentType);
      // Cache for 1 hour — channel photos rarely change
      reply.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      reply.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');

      return reply.send(upstream.body);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500);
      return { error: 'Failed to resolve channel photo' };
    }
  });

  // GET /channel/info — get subscriber count and channel description
  fastify.get('/info', async (request, reply) => {
    const channelId = process.env.CHANNEL_USERNAME;
    if (!channelId) {
      reply.status(503);
      return { error: 'CHANNEL_USERNAME is not configured' };
    }

    try {
      const [chat, memberCount] = await Promise.all([
        bot.getChat(channelId),
        bot.getChatMemberCount(channelId)
      ]);

      return {
        title: chat.title,
        description: chat.description || null,
        subscriberCount: memberCount
      };
    } catch (err) {
      fastify.log.error(err);
      reply.status(500);
      return { error: 'Failed to fetch channel info' };
    }
  });
};

export default channelRoutes;
