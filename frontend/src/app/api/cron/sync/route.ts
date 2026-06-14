import { NextResponse } from 'next/server';
import { syncStickyAndDeletions } from '@/bot/sync';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedCronSecret = process.env.CRON_SECRET;
    const expectedAdminSecret = process.env.ADMIN_SECRET || 'default-admin-secret';

    const cronSecretHeader = expectedCronSecret ? `Bearer ${expectedCronSecret}` : null;
    const adminSecretHeader = `Bearer ${expectedAdminSecret}`;

    if (!authHeader || (authHeader !== adminSecretHeader && (!cronSecretHeader || authHeader !== cronSecretHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channelId = process.env.CHANNEL_USERNAME;
    if (!channelId) {
      return NextResponse.json({ error: 'CHANNEL_USERNAME is not configured' }, { status: 500 });
    }

    await syncStickyAndDeletions(channelId);
    return NextResponse.json({ ok: true, message: 'Sticky status and deletions synced successfully' });
  } catch (err: any) {
    console.error('Error running cron sync:', err);
    return NextResponse.json({ error: 'Failed to run sync', details: err.message }, { status: 500 });
  }
}
export const revalidate = 0; // force dynamic rendering
