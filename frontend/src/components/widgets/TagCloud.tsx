'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TagData {
  tag: string;
  count: number;
}

function TagCloudContent() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');

  useEffect(() => {
    fetch(`${API_URL}/posts/tags`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(err => console.error('Error fetching tags:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || tags.length === 0) return null;

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
        Kategori Topik
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {tags.map((t) => {
          const isActive = currentTag === t.tag;
          return (
            <Link
              key={t.tag}
              href={isActive ? '/' : `/?tag=${encodeURIComponent(t.tag)}`}
              style={{
                fontSize: '12px', fontWeight: 600,
                padding: '6px 12px', borderRadius: '20px',
                textDecoration: 'none',
                background: isActive ? 'var(--accent-primary)' : 'rgba(139, 105, 20, 0.06)',
                color: isActive ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${isActive ? 'transparent' : 'rgba(139, 105, 20, 0.15)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {t.tag.replace('#', '')} <span style={{ opacity: isActive ? 0.8 : 0.5, marginLeft: '4px', fontSize: '10px' }}>({t.count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export function TagCloud() {
  return (
    <Suspense fallback={<div style={{ height: '100px' }} />}>
      <TagCloudContent />
    </Suspense>
  );
}
