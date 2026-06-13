import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import postsRoutes from './routes/posts';
import channelRoutes from './routes/channel';
import { syncAllPosts, handleWebhookUpdate } from './bot/sync';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

fastify.get('/health', async () => ({ status: 'ok' }));

// Telegram webhook handler
fastify.post<{ Params: { token: string } }>('/bot/:token', async (request, reply) => {
  const { token } = request.params;
  if (token !== process.env.BOT_TOKEN) {
    reply.status(401);
    return { error: 'Unauthorized' };
  }
  handleWebhookUpdate(request.body);
  return { ok: true };
});

fastify.register(postsRoutes, { prefix: '/posts' });
fastify.register(channelRoutes, { prefix: '/channel' });

const PORT = parseInt(process.env.PORT || '3001');

// Only start listening and syncing if not in test environment
if (process.env.NODE_ENV !== 'test') {
  fastify.listen({ port: PORT, host: '0.0.0.0' }, async (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    const channel = process.env.CHANNEL_USERNAME!;
    await syncAllPosts(channel);
    fastify.log.info(`[sync] Bot polling started for ${channel}`);
  });
}

export { fastify };
