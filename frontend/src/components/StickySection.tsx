import type { Post } from '../types/post';
import Link from 'next/link';
import { PostCard } from './PostCard';

interface Props {
  posts: Post[];
}

export function StickySection({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section style={{ marginBottom: '40px' }}>
      {/* Section label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '5px 14px 5px 10px',
          borderRadius: '20px',
          background: 'rgba(212, 160, 23, 0.12)',
          border: '1px solid rgba(212, 160, 23, 0.25)',
        }}>
          <span style={{ fontSize: '14px' }}>📌</span>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b6203' }}>
            Disematkan
          </span>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(210, 175, 80, 0.4), transparent)' }} />
      </div>

      {/* Sticky card(s) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: posts.length === 1
          ? '1fr'
          : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <PostCard post={post} variant="sticky" />
          </Link>
        ))}
      </div>
    </section>
  );
}
