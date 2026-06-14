import { NextResponse } from 'next/server';
import { getChannelLiveStatus } from '@/bot/sync';

export async function GET() {
  const isLive = await getChannelLiveStatus();
  return NextResponse.json({
    isLive,
    channelUrl: `https://t.me/${process.env.CHANNEL_USERNAME?.replace('@', '')}`
  });
}
export const revalidate = 0; // force dynamic rendering
