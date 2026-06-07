'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChannelInfo {
  title: string;
  description: string | null;
  subscriberCount: number;
}

export function ChannelStats() {
  const [info, setInfo] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/channel/info`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setInfo(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !info) return null;

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
        marginBottom: '12px', borderBottom: '1px solid rgba(210, 195, 150, 0.3)',
        paddingBottom: '10px'
      }}>
        Tentang Channel
      </h3>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
        fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600
      }}>
        <span style={{ fontSize: '18px' }}>👥</span>
        <span>
          {info.subscriberCount.toLocaleString('id-ID')} Subscribers
        </span>
      </div>

      {info.description && (
        <p style={{
          fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)',
          marginBottom: '20px', whiteSpace: 'pre-wrap',
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {info.description}
        </p>
      )}

      {/* The channel username isn't returned from /info directly (though we can guess from URL),
          but we can link to the standard Telegram URL if we know it.
          Since we don't have the explicit username with @ in the frontend easily without env,
          we might just not show the join button or we can read it from the url later.
          Actually, we can just use a simple generic button or omit it if we don't have the link.
      */}
    </div>
  );
}
