'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MinimalPost {
  id: number;
  content: string;
  views: number;
}

export function PopularPostsWidget() {
  const [posts, setPosts] = useState<MinimalPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/posts?sort=popular&limit=5`)
      .then(res => res.json())
      .then(res => {
        if (res && Array.isArray(res.data)) {
          setPosts(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255, 255, 245, 0.82)',
      border: '1px solid rgba(210, 195, 150, 0.35)',
      borderRadius: '14px',
      padding: '24px',
      marginBottom: '24px',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 1px 6px rgba(100, 80, 20, 0.06)',
    }}>
      <h3 style={{
        fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)',
        marginBottom: '16px', borderBottom: '1px solid rgba(210, 195, 150, 0.3)',
        paddingBottom: '10px'
      }}>
        🔥 Paling Banyak Dibaca
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post, idx) => {
          // Buat cuplikan judul pendek dari konten
          const titleSnippet = post.content ? post.content.split('\n')[0].substring(0, 50) + '...' : 'Postingan Media';
          return (
            <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '8px', borderRadius: '8px', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 105, 20, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  fontSize: '14px', fontWeight: 800, color: 'rgba(180, 150, 60, 0.4)',
                  minWidth: '20px'
                }}>
                  {idx + 1}.
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4', marginBottom: '4px' }}>
                    {titleSnippet}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    👀 {post.views || 0} kali dibaca
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
