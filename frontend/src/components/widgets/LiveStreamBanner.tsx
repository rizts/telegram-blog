'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function LiveStreamBanner() {
  const [isLive, setIsLive] = useState(false);
  const [channelUrl, setChannelUrl] = useState('');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkLiveStatus = () => {
      fetch(`${API_URL}/channel/live`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.isLive === 'boolean') {
            setIsLive(data.isLive);
            if (data.channelUrl) setChannelUrl(data.channelUrl);
          }
        })
        .catch(err => console.error('Error fetching live status:', err));
    };

    // Check immediately
    checkLiveStatus();

    // Poll every 10 seconds
    intervalId = setInterval(checkLiveStatus, 10000);

    return () => clearInterval(intervalId);
  }, []);

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
        paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        Telegram Live Stream
        {isLive ? (
          <span style={{
            fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '12px',
            background: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f',
            border: '1px solid rgba(244, 67, 54, 0.3)', display: 'flex', alignItems: 'center', gap: '6px',
            animation: 'pulse-live 2s infinite'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d32f2f' }}></span>
            LIVE
          </span>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '12px',
            background: 'rgba(150, 150, 150, 0.1)', color: '#777',
            border: '1px solid rgba(150, 150, 150, 0.3)'
          }}>
            OFFLINE
          </span>
        )}
      </h3>

      <style>{`
        @keyframes pulse-live {
          0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(244, 67, 54, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
      `}</style>

      {isLive ? (
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 600, padding: '12px 16px',
            borderRadius: '10px', textDecoration: 'none',
            background: 'linear-gradient(135deg, #d32f2f, #f44336)',
            color: 'white',
            boxShadow: '0 4px 10px rgba(211, 47, 47, 0.2)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>🎧</span> Bergabung ke Siaran
        </a>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'center' }}>
          Saat ini tidak ada siaran langsung di Telegram.
        </div>
      )}
    </div>
  );
}
