import type { Post } from '../../../types/post';
import Link from 'next/link';
import { ViewCounter } from '../../../components/ViewCounter';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PageProps {
  params: Promise<{ id: string }>;
}

function MediaViewer({ post }: { post: Post }) {
  if (!post.mediaType || !post.mediaUrl) return null;

  const url = `${API_URL}/posts/${post.id}/media`;

  const wrapperStyle: React.CSSProperties = {
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '28px',
    border: '1px solid rgba(210, 190, 120, 0.3)',
    background: 'rgba(255, 248, 210, 0.4)',
  };

  // ── Photo ──────────────────────────────────────────────────────────────────
  if (post.mediaType === 'photo') {
    return (
      <div style={wrapperStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Post photo"
          style={{
            width: '100%',
            maxHeight: '520px',
            objectFit: 'contain',
            display: 'block',
            background: 'rgba(200, 180, 100, 0.08)',
          }}
        />
      </div>
    );
  }

  // ── Video ──────────────────────────────────────────────────────────────────
  if (post.mediaType === 'video') {
    return (
      <div style={wrapperStyle}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={url}
          controls
          preload="metadata"
          style={{
            width: '100%',
            maxHeight: '520px',
            display: 'block',
            background: '#000',
          }}
        />
      </div>
    );
  }

  // ── Document / PDF ────────────────────────────────────────────────────────
  if (post.mediaType === 'document') {
    // Detect by file extension hint in the stored file_id or just show PDF viewer
    const looksLikePdf = post.mediaUrl.toLowerCase().includes('pdf') ||
                         post.mediaUrl.toLowerCase().includes('.pdf');

    if (looksLikePdf) {
      return (
        <div style={{ ...wrapperStyle, height: '640px' }}>
          <iframe
            src={url}
            title="PDF Viewer"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>
      );
    }

    // Generic document — show download button
    return (
      <div style={{
        ...wrapperStyle,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>📄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
            Document File
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click the button to view or download this file.
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '20px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
            color: 'white', background: 'var(--accent-primary)',
            border: '1px solid rgba(139, 105, 20, 0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          ↓ Download
        </a>
      </div>
    );
  }

  return null;
}

export default async function PostDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let post: Post | null = null;

  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      next: { revalidate: 60 }, // ISR: Cache details and revalidate every 60s
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
    <div className="animate-fadeInUp" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <ViewCounter postId={post.id} />
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          color: 'var(--accent-primary)',
          marginBottom: '24px',
          padding: '7px 14px',
          borderRadius: '20px',
          background: 'rgba(139, 105, 20, 0.07)',
          border: '1px solid rgba(139, 105, 20, 0.15)',
          transition: 'all 0.2s ease',
        }}
      >
        ← Kembali ke daftar postingan
      </Link>

      {/* Article card */}
      <article style={{
        background: 'rgba(255, 255, 245, 0.88)',
        border: '1px solid rgba(210, 190, 120, 0.35)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(100, 80, 20, 0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Article header meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          paddingBottom: '20px', marginBottom: '24px',
          borderBottom: '1px solid rgba(210, 190, 120, 0.25)',
        }}>
          {post.isSticky && (
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '20px',
              background: 'rgba(212, 160, 23, 0.15)', color: '#8b6203',
              border: '1px solid rgba(212, 160, 23, 0.3)',
            }}>
              📌 Pinned
            </span>
          )}
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(139, 105, 20, 0.09)', color: 'var(--accent-primary)',
            border: '1px solid rgba(139, 105, 20, 0.18)',
          }}>
            @{post.channelUsername}
          </span>
          <time style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {date}
          </time>
        </div>

        {/* Real media viewer */}
        <MediaViewer post={post} />

        {/* Body content */}
        {post.content && (
          <div className="article-body">
            {post.content.split('\n').map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i}>{paragraph}</p>
              ) : (
                <br key={i} />
              )
            )}
          </div>
        )}
      </article>
    </div>
  );
}
