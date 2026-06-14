import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // 1. Authorization check
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.ADMIN_SECRET || 'default-admin-secret';
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { isSticky } = body;
    if (typeof isSticky !== 'boolean') {
      return NextResponse.json({ error: 'isSticky is required and must be a boolean' }, { status: 400 });
    }

    // 3. Update database
    const updated = await db
      .update(posts)
      .set({ isSticky, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error(`Error in PATCH /api/posts/[id]/sticky:`, err);
    return NextResponse.json({ error: 'Failed to update sticky status' }, { status: 500 });
  }
}
