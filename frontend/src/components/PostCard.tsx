'use client';

import type { Post } from '../types/post';

interface Props {
  post: Post;
  variant?: 'default' | 'sticky';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function mediaUrl(postId: number) {
  return `${API_URL}/posts/${postId}/media`;
}

function MediaThumb({ post }: { post: Post }) {
  if (!post.mediaType || !post.mediaUrl) return null;

  const url = mediaUrl(post.id);

  if (post.mediaType === 'photo') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Post image"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          objectFit: 'cover',
          borderRadius: '10px',
          marginBottom: '12px',
          display: 'block',
          border: '1px solid rgba(210, 190, 120, 0.2)',
          backgroundColor: 'rgba(200, 180, 100, 0.1)',
        }}
        loading="lazy"
        onError={(e) => {
          // Hide broken image gracefully
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  if (post.mediaType === 'video') {
    return (
      <div style={{
        width: '100%', aspectRatio: '16/9',
        borderRadius: '10px', overflow: 'hidden',
        marginBottom: '12px',
        background: 'rgba(20, 15, 5, 0.06)',
        border: '1px solid rgba(210, 190, 120, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: '2rem' }}>🎥</span>
        <span style={{
          position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>Video</span>
      </div>
    );
  }

  if (post.mediaType === 'document') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', borderRadius: '8px',
        background: 'rgba(139, 105, 20, 0.06)',
        border: '1px solid rgba(200, 175, 100, 0.2)',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📄</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)' }}>Document</span>
      </div>
    );
  }

  return null;
}

export function PostCard({ post, variant = 'default' }: Props) {
  const date = new Date(post.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const isSticky = variant === 'sticky' || post.isSticky;

  const cardStyle: React.CSSProperties = {
    background: isSticky
      ? 'rgba(255, 248, 210, 0.9)'
      : 'rgba(255, 255, 245, 0.82)',
    border: `1px solid ${isSticky ? 'rgba(210, 175, 60, 0.4)' : 'rgba(210, 195, 150, 0.35)'}`,
    borderRadius: '14px',
    padding: '18px',
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(6px)',
    boxShadow: isSticky
      ? '0 2px 12px rgba(180, 140, 20, 0.1)'
      : '0 1px 6px rgba(100, 80, 20, 0.06)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <article style={cardStyle} className="card-hover">
      {/* Real media thumbnail */}
      <MediaThumb post={post} />

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {isSticky && (
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: '20px',
            background: 'rgba(212, 160, 23, 0.15)', color: '#8b6203',
            border: '1px solid rgba(212, 160, 23, 0.25)',
          }}>
            📌 Pinned
          </span>
        )}
        <span style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em',
          padding: '3px 8px', borderRadius: '20px',
          background: 'rgba(139, 105, 20, 0.08)', color: 'var(--accent-primary)',
          border: '1px solid rgba(139, 105, 20, 0.15)',
        }}>
          @{post.channelUsername}
        </span>
        <time style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {date}
        </time>
      </div>

      {/* Content */}
      {post.content && (
        <p style={{
          fontSize: '14px',
          lineHeight: '1.7',
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
          flex: 1,
        }}>
          {post.content}
        </p>
      )}
    </article>
  );
}
