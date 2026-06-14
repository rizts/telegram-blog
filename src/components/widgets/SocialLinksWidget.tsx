'use client';

interface Props {
  instagram: string;
  youtube: string;
  xUrl: string;
  facebook: string;
}

export function SocialLinksWidget({ instagram, youtube, xUrl, facebook }: Props) {
  if (!instagram && !youtube && !xUrl && !facebook) return null;

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
        Temukan Kami
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" style={iconStyle} title="Instagram">
            📸 IG
          </a>
        )}
        {youtube && (
          <a href={youtube} target="_blank" rel="noopener noreferrer" style={iconStyle} title="YouTube">
            ▶️ YT
          </a>
        )}
        {xUrl && (
          <a href={xUrl} target="_blank" rel="noopener noreferrer" style={iconStyle} title="X (Twitter)">
            🐦 X
          </a>
        )}
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" style={iconStyle} title="Facebook">
            📘 FB
          </a>
        )}
      </div>
    </div>
  );
}

const iconStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px 16px', borderRadius: '20px',
  background: 'rgba(139, 105, 20, 0.08)',
  color: 'var(--accent-primary)',
  textDecoration: 'none',
  fontSize: '13px', fontWeight: 700,
  border: '1px solid rgba(139, 105, 20, 0.15)',
  transition: 'all 0.2s',
};
