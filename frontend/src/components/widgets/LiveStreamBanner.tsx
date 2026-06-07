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

  if (!isLive || !channelUrl) return null;

  return (
    <a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: 'linear-gradient(135deg, #d32f2f, #f44336)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '14px',
        marginBottom: '24px',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'pulse 2s infinite'
      }}
      className="live-banner"
    >
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
          100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
        }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{
          width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%',
          boxShadow: '0 0 10px white'
        }}></div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Siaran Langsung
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>
            Sedang berlangsung di Telegram. Klik untuk bergabung!
          </p>
        </div>
      </div>
    </a>
  );
}
