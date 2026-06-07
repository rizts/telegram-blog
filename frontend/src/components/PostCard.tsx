import type { Post } from '../types/post';

interface Props {
  post: Post;
  variant?: 'default' | 'sticky';
}

function MediaPreview({ post }: { post: Post }) {
  if (!post.mediaType || !post.mediaUrl) return null;

  if (post.mediaType === 'photo') {
    return (
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(200, 175, 100, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        border: '1px solid rgba(200, 175, 100, 0.2)',
        position: 'relative',
      }}>
        {/* Telegram photos are stored by file_id, not a direct URL — show a styled placeholder */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🖼️</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
            Photo Attachment
          </span>
        </div>
      </div>
    );
  }

  if (post.mediaType === 'video') {
    return (
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(60, 40, 10, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        border: '1px solid rgba(200, 175, 100, 0.2)',
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🎥</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
            Video Attachment
          </span>
        </div>
      </div>
    );
  }

  if (post.mediaType === 'document') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: 'rgba(139, 105, 20, 0.06)',
        border: '1px solid rgba(200, 175, 100, 0.25)',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>📄</span>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>Document</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>File attachment</div>
        </div>
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
      {/* Media Preview */}
      <MediaPreview post={post} />

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
          WebkitLineClamp: 5,
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
