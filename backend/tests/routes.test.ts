import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import postsRoutes from '../src/routes/posts';

const mockStickyPost = { id: 1, content: 'Sticky post', isSticky: true, publishedAt: new Date(), channelUsername: 'test', isDeleted: false };
const mockRegularPost = { id: 2, content: 'Regular post', isSticky: false, publishedAt: new Date(), channelUsername: 'test', isDeleted: false };

function createQueryBuilder(resolveValue: any) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: (onfulfilled: any) => Promise.resolve(resolveValue).then(onfulfilled),
  };
}

vi.mock('../src/db/client', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '../src/db/client';

async function buildApp() {
  const app = Fastify();
  await app.register(postsRoutes, { prefix: '/posts' });
  await app.ready();
  return app;
}

describe('GET /posts', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
    vi.restoreAllMocks();
  });

  it('returns 200 with sticky and data keys', async () => {
    vi.mocked(db.select)
      .mockImplementationOnce(() => createQueryBuilder([mockStickyPost]) as any)
      .mockImplementationOnce(() => createQueryBuilder([mockRegularPost]) as any)
      .mockImplementationOnce(() => createQueryBuilder([{ count: 1 }]) as any);

    const res = await app.inject({ method: 'GET', url: '/posts' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('sticky');
    expect(body.sticky).toHaveLength(1);
    expect(body.sticky[0].content).toBe('Sticky post');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveLength(1);
    expect(body.data[0].content).toBe('Regular post');
    expect(body).toHaveProperty('meta');
    expect(body.meta.total).toBe(1);
  });

  it('supports pagination query params', async () => {
    vi.mocked(db.select)
      .mockImplementationOnce(() => createQueryBuilder([mockStickyPost]) as any)
      .mockImplementationOnce(() => createQueryBuilder([mockRegularPost]) as any)
      .mockImplementationOnce(() => createQueryBuilder([{ count: 1 }]) as any);

    const res = await app.inject({ method: 'GET', url: '/posts?page=2&limit=5' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for unknown post id', async () => {
    vi.mocked(db.select).mockImplementationOnce(() => createQueryBuilder([]) as any);

    const res = await app.inject({ method: 'GET', url: '/posts/99999' });
    expect(res.statusCode).toBe(404);
  });
});

describe('PATCH /posts/:id/sticky', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
    vi.restoreAllMocks();
  });

  it('toggles sticky and returns updated post', async () => {
    vi.mocked(db.update).mockImplementationOnce(() => createQueryBuilder([{ ...mockStickyPost, isSticky: false }]) as any);

    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/1/sticky',
      payload: { isSticky: false },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.isSticky).toBe(false);
  });

  it('returns 400 when body is missing isSticky field', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/1/sticky',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for unknown post id', async () => {
    vi.mocked(db.update).mockImplementationOnce(() => createQueryBuilder([]) as any);

    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/99999/sticky',
      payload: { isSticky: true },
    });
    expect(res.statusCode).toBe(404);
  });
});
