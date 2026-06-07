'use client';

import { useState } from 'react';

interface Props {
  apiUrl: string;
  title: string;
}

export default function ChannelLogo({ apiUrl, title }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${apiUrl}/channel/photo`}
      alt={`${title} logo`}
      onError={() => setVisible(false)}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(139, 105, 20, 0.25)',
        boxShadow: '0 1px 6px rgba(100, 80, 20, 0.15)',
        flexShrink: 0,
      }}
    />
  );
}
