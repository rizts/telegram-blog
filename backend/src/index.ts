import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import postsRoutes from './routes/posts';
import { syncAllPosts } from './bot/sync';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

fastify.get('/health', async () => ({ status: 'ok' }));
fastify.register(postsRoutes, { prefix: '/posts' });

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
