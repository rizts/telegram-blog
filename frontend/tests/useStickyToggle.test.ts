import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStickyToggle } from '../src/hooks/usePosts';

afterEach(() => vi.restoreAllMocks());

describe('useStickyToggle', () => {
  it('calls PATCH endpoint and returns updated post', async () => {
    const updatedPost = { id: 1, isSticky: true };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => updatedPost,
    }));

    const { result } = renderHook(() => useStickyToggle());
    let returned: any;

    await act(async () => {
      returned = await result.current.toggle(1, true);
    });

    expect(returned).toEqual(updatedPost);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const { result } = renderHook(() => useStickyToggle());

    await act(async () => {
      await result.current.toggle(1, true);
    });

    expect(result.current.error).toBeTruthy();
  });
});
