import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

export async function GET() {
  const channelId = process.env.CHANNEL_USERNAME;
  if (!channelId) {
    return NextResponse.json({ error: 'CHANNEL_USERNAME is not configured' }, { status: 503 });
  }

  try {
    const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });
    const chat = await bot.getChat(channelId);

    if (!chat.photo?.small_file_id) {
      return NextResponse.json({ error: 'Channel has no profile photo' }, { status: 404 });
    }

    const fileInfo = await bot.getFile(chat.photo.big_file_id ?? chat.photo.small_file_id);
    if (!fileInfo.file_path) {
      return NextResponse.json({ error: 'File path not available' }, { status: 404 });
    }

    const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
    const upstream = await fetch(telegramFileUrl);

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch photo from Telegram' }, { status: 502 });
    }

    const ext = fileInfo.file_path.split('.').pop()?.toLowerCase() ?? 'jpg';
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    return new Response(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Error resolving channel photo:', err);
    return NextResponse.json({ error: 'Failed to resolve channel photo' }, { status: 500 });
  }
}
