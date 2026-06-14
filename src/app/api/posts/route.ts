import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const sortParam = searchParams.get('sort') ?? 'newest';
    const tagParam = searchParams.get('tag');
    const searchParam = searchParams.get('search');

    const notDeleted = eq(posts.isDeleted, false);
    const hasContentOrMedia = sql`(${posts.content} IS NOT NULL OR ${posts.mediaUrl} IS NOT NULL)`;
    const tagFilter = tagParam ? sql`${tagParam} = ANY(${posts.tags})` : sql`TRUE`;
    const searchFilter = searchParam ? sql`${posts.content} ILIKE ${`%${searchParam}%`}` : sql`TRUE`;
    const orderClause = sortParam === 'popular' ? desc(posts.views) : desc(posts.publishedAt);

    // Check if there are matching sticky/pinned posts
    const stickyCheck = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(notDeleted, hasContentOrMedia, eq(posts.isSticky, true), tagFilter, searchFilter))
      .limit(1);
    const hasSticky = stickyCheck.length > 0;

    const defaultLimit = hasSticky ? 4 : 10;
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? defaultLimit.toString()));
    const offset = (page - 1) * limit;

    const [stickyData, regularData, countResult] = await Promise.all([
      db
        .select()
        .from(posts)
        .where(and(notDeleted, hasContentOrMedia, eq(posts.isSticky, true), tagFilter, searchFilter))
        .orderBy(desc(posts.publishedAt)),

      db
        .select()
        .from(posts)
        .where(and(notDeleted, hasContentOrMedia, eq(posts.isSticky, false), tagFilter, searchFilter))
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(notDeleted, hasContentOrMedia, eq(posts.isSticky, false), tagFilter, searchFilter)),
    ]);

    const total = Number(countResult[0].count);

    return NextResponse.json({
      sticky: stickyData,
      data: regularData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/posts:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
