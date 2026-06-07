'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchWidgetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [query, setQuery] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

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
        Pencarian
      </h3>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Cari artikel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '8px',
            border: '1px solid rgba(139, 105, 20, 0.2)',
            fontSize: '13px', outline: 'none',
            background: 'rgba(255,255,255,0.5)',
          }}
        />
        <button type="submit" style={{
          padding: '10px 14px', borderRadius: '8px',
          background: 'var(--accent-primary)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        }}>
          Cari
        </button>
      </form>
    </div>
  );
}

export function SearchWidget() {
  return (
    <Suspense fallback={<div style={{ height: '100px' }} />}>
      <SearchWidgetContent />
    </Suspense>
  );
}
