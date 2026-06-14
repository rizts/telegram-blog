import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

export async function GET() {
  const channelId = process.env.CHANNEL_USERNAME;
  if (!channelId) {
    return NextResponse.json({ error: 'CHANNEL_USERNAME is not configured' }, { status: 503 });
  }

  try {
    const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });
    const [chat, memberCount] = await Promise.all([
      bot.getChat(channelId),
      bot.getChatMemberCount(channelId)
    ]);

    return NextResponse.json({
      title: chat.title,
      description: chat.description || null,
      subscriberCount: memberCount
    });
  } catch (err: any) {
    console.error('Error fetching channel info:', err);
    return NextResponse.json({ error: 'Failed to fetch channel info' }, { status: 500 });
  }
}
