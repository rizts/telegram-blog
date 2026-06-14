'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function ViewCounter({ postId }: { postId: number }) {
  useEffect(() => {
    // Fire and forget
    fetch(`${API_URL}/posts/${postId}/view`, { method: 'POST' })
      .catch(err => console.error('Failed to increment views', err));
  }, [postId]);

  return null;
}
