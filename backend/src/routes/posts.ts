import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /posts?page=1&limit=10
  // Returns all sticky posts (unpaginated) + regular posts (paginated)
  fastify.get<{ Querystring: { page?: string; limit?: string; sort?: 'newest' | 'popular'; tag?: string; search?: string } }>('/', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1'));
    const limit = Math.min(50, parseInt(request.query.limit ?? '10'));
    const offset = (page - 1) * limit;
    const sortParam = request.query.sort ?? 'newest';
    const tagParam = request.query.tag;
    const searchParam = request.query.search;

    const notDeleted = eq(posts.isDeleted, false);
    const tagFilter = tagParam ? sql`${tagParam} = ANY(${posts.tags})` : sql`TRUE`;
    const searchFilter = searchParam ? sql`${posts.content} ILIKE ${`%${searchParam}%`}` : sql`TRUE`;
    const orderClause = sortParam === 'popular' ? desc(posts.views) : desc(posts.publishedAt);

    const [stickyData, regularData, countResult] = await Promise.all([
      // Sticky posts — all are displayed, sorted by newest
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, true), tagFilter, searchFilter))
        .orderBy(desc(posts.publishedAt)),

      // Regular posts — paginated, excluding sticky posts
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false), tagFilter, searchFilter))
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),

      // Count total regular posts for pagination
      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false), tagFilter, searchFilter)),
    ]);

    return {
      sticky: stickyData,
      data: regularData,
      meta: {
        page,
        limit,
        total: Number(countResult[0].count),
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  });

  // GET /posts/tags — get all tags and their counts
  fastify.get('/tags', async (request, reply) => {
    const result = await db.execute(sql`
      SELECT unnest(tags) as tag, count(*) as count
      FROM posts
      WHERE is_deleted = false
      GROUP BY tag
      ORDER BY count DESC
    `);
    return result.rows;
  });

  // GET /posts/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, parseInt(request.params.id)), eq(posts.isDeleted, false)))
      .limit(1);

    if (!post.length) {
      reply.status(404);
      return { error: 'Post not found' };
    }

    return post[0];
  });

  // POST /posts/:id/view — increment view count
  fastify.post<{ Params: { id: string } }>('/:id/view', async (request, reply) => {
    const id = parseInt(request.params.id);
    const updated = await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id))
      .returning({ views: posts.views });

    if (!updated.length) {
      reply.status(404);
      return { error: 'Post not found' };
    }
    return updated[0];
  });

  // GET /posts/:id/media — proxy actual media file from Telegram CDN
  // Resolves file_id → file_path via Bot API, then streams the file to the client.
  // This keeps the bot token server-side and never exposes it to the browser.
  fastify.get<{ Params: { id: string } }>('/:id/media', async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, parseInt(request.params.id)), eq(posts.isDeleted, false)))
      .limit(1);

    if (!post.length || !post[0].mediaUrl || !post[0].mediaType) {
      reply.status(404);
      return { error: 'No media for this post' };
    }

    const { mediaUrl: fileId, mediaType } = post[0];

    try {
      const fileInfo = await bot.getFile(fileId);
      if (!fileInfo.file_path) {
        reply.status(404);
        return { error: 'File path not found on Telegram servers' };
      }

      const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;

      // Determine Content-Type from file extension
      const ext = fileInfo.file_path.split('.').pop()?.toLowerCase() ?? '';
      const contentTypeMap: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg',
        png: 'image/png', gif: 'image/gif', webp: 'image/webp',
        mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
        pdf: 'application/pdf',
        mp3: 'audio/mpeg', ogg: 'audio/ogg', opus: 'audio/opus',
      };
      const contentType = contentTypeMap[ext] ?? (
        mediaType === 'photo' ? 'image/jpeg' :
        mediaType === 'video' ? 'video/mp4' :
        'application/octet-stream'
      );

      // Stream the file from Telegram through our server
      const upstream = await fetch(telegramFileUrl);
      if (!upstream.ok) {
        reply.status(502);
        return { error: 'Failed to fetch file from Telegram' };
      }

      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'public, max-age=86400'); // cache 24h
      reply.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');

      return reply.send(upstream.body);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500);
      return { error: 'Failed to resolve media from Telegram' };
    }
  });

  // PATCH /posts/:id/sticky — toggle sticky status of a post
  fastify.patch<{ Params: { id: string }; Body: { isSticky: boolean } }>(
    '/:id/sticky',
    {
      schema: {
        body: {
          type: 'object',
          required: ['isSticky'],
          properties: {
            isSticky: { type: 'boolean' },
          },
        },
      },
      preHandler: async (request, reply) => {
        const authHeader = request.headers.authorization;
        const expectedSecret = process.env.ADMIN_SECRET || 'default-admin-secret';
        if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
          reply.status(401);
          throw new Error('Unauthorized');
        }
      },
    },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      const { isSticky } = request.body;

      const updated = await db
        .update(posts)
        .set({ isSticky, updatedAt: new Date() })
        .where(eq(posts.id, id))
        .returning();

      if (!updated.length) {
        reply.status(404);
        return { error: 'Post not found' };
      }

      return updated[0];
    }
  );
};

export default postsRoutes;
