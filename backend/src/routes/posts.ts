import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /posts?page=1&limit=10
  // Mengembalikan sticky posts (semua, tanpa paginasi) + regular posts (dengan paginasi)
  fastify.get<{ Querystring: { page?: string; limit?: string } }>('/', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1'));
    const limit = Math.min(50, parseInt(request.query.limit ?? '10'));
    const offset = (page - 1) * limit;

    const notDeleted = eq(posts.isDeleted, false);

    const [stickyData, regularData, countResult] = await Promise.all([
      // Sticky posts — selalu tampil semua, diurutkan terbaru
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, true)))
        .orderBy(desc(posts.publishedAt)),

      // Regular posts — dengan paginasi, exclude yang sticky
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
        .offset(offset),

      // Hitung total regular posts untuk paginasi
      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false))),
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

  // GET /posts/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(request.params.id)))
      .limit(1);

    if (!post.length) {
      reply.status(404);
      return { error: 'Post not found' };
    }

    return post[0];
  });

  // PATCH /posts/:id/sticky — toggle status sticky sebuah post
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
