import { NextResponse } from 'next/server';
import { setupWebhook } from '@/bot/sync';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SECRET || 'default-admin-secret';

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: 'WEBHOOK_URL is not configured in environment variables' }, { status: 400 });
    }

    const targetUrl = `${webhookUrl}/api/bot/${process.env.BOT_TOKEN}`;
    await setupWebhook(targetUrl);

    return NextResponse.json({ ok: true, message: `Webhook registered successfully at: ${targetUrl}` });
  } catch (err: any) {
    console.error('Error setting up webhook:', err);
    return NextResponse.json({ error: 'Failed to set up webhook', details: err.message }, { status: 500 });
  }
}
