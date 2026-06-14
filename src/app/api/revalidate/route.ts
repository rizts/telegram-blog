import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path } = body;

    // Validate secret token against env
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'secret-token';
    if (secret !== revalidateSecret) {
      return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    // Default revalidate home page
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, path: '/', now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
