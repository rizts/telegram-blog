import { useState, useEffect } from 'react';
import type { Post, PaginatedResponse } from '../types/post';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function usePosts(page = 1, limit = 10) {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/posts?page=${page}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal fetch posts');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { data, loading, error };
}

// Hook untuk toggle sticky status sebuah post
export function useStickyToggle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (postId: number, isSticky: boolean): Promise<Post | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/sticky`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || 'default-admin-secret'}`
        },
        body: JSON.stringify({ isSticky }),
      });
      if (!res.ok) throw new Error('Gagal update sticky status');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading, error };
}
