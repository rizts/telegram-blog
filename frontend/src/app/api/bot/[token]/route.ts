import { NextResponse } from 'next/server';
import { handleWebhookUpdate } from '@/bot/sync';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const { token } = resolvedParams;

    if (token !== process.env.BOT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    await handleWebhookUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error processing bot webhook:', err);
    return NextResponse.json({ error: 'Failed to process update' }, { status: 500 });
  }
}
