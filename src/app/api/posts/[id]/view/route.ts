import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const updated = await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id))
      .returning({ views: posts.views });

    if (!updated.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error(`Error in POST /api/posts/[id]/view:`, err);
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
  }
}
