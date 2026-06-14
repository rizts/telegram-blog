import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import TelegramBot from 'node-telegram-bot-api';

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

    if (!post.length || !post[0].mediaUrl || !post[0].mediaType) {
      return NextResponse.json({ error: 'No media for this post' }, { status: 404 });
    }

    const { mediaUrl: fileId, mediaType } = post[0];
    const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

    const fileInfo = await bot.getFile(fileId);
    if (!fileInfo.file_path) {
      return NextResponse.json({ error: 'File path not found on Telegram servers' }, { status: 404 });
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

    const upstream = await fetch(telegramFileUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch file from Telegram' }, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error(`Error in GET /api/posts/[id]/media:`, err);
    return NextResponse.json({ error: 'Failed to resolve media' }, { status: 500 });
  }
}
