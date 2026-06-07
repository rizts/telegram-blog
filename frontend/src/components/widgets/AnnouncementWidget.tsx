'use client';

export function AnnouncementWidget({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 250, 230, 0.9), rgba(245, 235, 200, 0.8))',
      border: '1px solid rgba(210, 195, 150, 0.5)',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(100, 80, 20, 0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-10px', right: '-10px', fontSize: '60px', opacity: 0.1, transform: 'rotate(15deg)'
      }}>📢</div>
      <h3 style={{
        fontSize: '14px', fontWeight: 800, color: '#8b6203',
        marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>📌</span> Pengumuman
      </h3>
      <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
        {text}
      </p>
    </div>
  );
}
