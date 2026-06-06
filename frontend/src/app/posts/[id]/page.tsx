import type { Post } from '../../../types/post';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let post: Post | null = null;

  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      cache: 'no-store', // Disable caching for SSR per request
    });

    if (res.status === 404) {
      notFound();
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.statusText}`);
    }

    post = await res.json();
  } catch (err) {
    console.error('Error fetching post detail:', err);
    // Let Next.js handle the boundary or render notFound
    notFound();
  }

  if (!post) {
    notFound();
  }

  const date = new Date(post.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
        ← Kembali ke daftar postingan
      </Link>

      <article className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          {post.isSticky && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">
              📌 Sticky
            </span>
          )}
          <span className="text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
            @{post.channelUsername}
          </span>
          <time className="text-xs text-gray-400">{date}</time>
        </div>

        {post.content && (
          <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.mediaType && post.mediaUrl && (
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              {post.mediaType === 'photo' ? '📷 Photo Attachment' : post.mediaType === 'video' ? '🎥 Video Attachment' : '📁 Document File'}
            </span>
            <span className="text-xs text-gray-400 font-mono select-all">
              ID: {post.mediaUrl}
            </span>
          </div>
        )}
      </article>
    </div>
  );
}
