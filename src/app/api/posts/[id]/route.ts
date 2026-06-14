import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.isDeleted, false)))
      .limit(1);

    if (!post.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post[0]);
  } catch (err: any) {
    console.error(`Error in GET /api/posts/[id]:`, err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
