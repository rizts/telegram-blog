import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT unnest(tags) as tag, count(*) as count
      FROM posts
      WHERE is_deleted = false
      GROUP BY tag
      ORDER BY count DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error('Error in GET /api/posts/tags:', err);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
