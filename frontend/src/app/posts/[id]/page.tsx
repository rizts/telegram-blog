import type { Post } from '../../../types/post';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PageProps {
  params: Promise<{ id: string }>;
}

function MediaPreview({ post }: { post: Post }) {
  if (!post.mediaType || !post.mediaUrl) return null;

  const containerStyle: React.CSSProperties = {
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
    border: '1px solid rgba(210, 190, 120, 0.3)',
  };

  if (post.mediaType === 'photo') {
    return (
      <div style={containerStyle}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 245, 200, 0.9) 0%, rgba(255, 235, 160, 0.7) 100%)',
          aspectRatio: '16/9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '32px',
        }}>
          <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 2px 8px rgba(180,140,20,0.2))' }}>🖼️</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
              Photo Attachment
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '320px' }}>
              File ID: {post.mediaUrl}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (post.mediaType === 'video') {
    return (
      <div style={containerStyle}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(40, 30, 10, 0.08) 0%, rgba(80, 60, 20, 0.06) 100%)',
          aspectRatio: '16/9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '32px',
        }}>
          <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 2px 8px rgba(100,80,20,0.15))' }}>🎥</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
              Video Attachment
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '320px' }}>
              File ID: {post.mediaUrl}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (post.mediaType === 'document') {
    return (
      <div style={{
        ...containerStyle,
        padding: '20px 24px',
        background: 'rgba(255, 248, 210, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>📄</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
            Document File
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            File ID: {post.mediaUrl}
          </div>
        </div>
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
    <div className="animate-fadeInUp" style={{ maxWidth: '720px', margin: '0 auto' }}>
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

        {/* Media Preview */}
        <MediaPreview post={post} />

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
