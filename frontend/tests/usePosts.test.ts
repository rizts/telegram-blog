import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '../src/hooks/usePosts';

const mockResponse = {
  data: [{ id: 1, content: 'Post 1', channelUsername: 'test', publishedAt: new Date().toISOString() }],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

afterEach(() => vi.restoreAllMocks());

describe('usePosts', () => {
  it('fetches posts and returns data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const { result } = renderHook(() => usePosts(1, 10));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const { result } = renderHook(() => usePosts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});
