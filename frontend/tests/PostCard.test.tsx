import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCard } from '../src/components/PostCard';
import type { Post } from '../src/types/post';

const mockPost: Post = {
  id: 1,
  telegramMessageId: 100,
  channelUsername: 'testchannel',
  content: 'Ini konten post test',
  mediaUrl: null,
  mediaType: null,
  forwardedFrom: null,
  publishedAt: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-15T10:00:00.000Z',
  isSticky: false,
};

describe('PostCard', () => {
  it('renders post content', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Ini konten post test')).toBeTruthy();
  });

  it('renders channel username with @', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('@testchannel')).toBeTruthy();
  });

  it('shows photo indicator when mediaType is photo', () => {
    render(<PostCard post={{ ...mockPost, mediaType: 'photo', mediaUrl: 'file123' }} />);
    expect(screen.getByText(/ada lampiran foto/i)).toBeTruthy();
  });

  it('does not render content when null', () => {
    render(<PostCard post={{ ...mockPost, content: null }} />);
    expect(screen.queryByText('Ini konten post test')).toBeNull();
  });

  it('shows sticky badge when isSticky is true', () => {
    render(<PostCard post={{ ...mockPost, isSticky: true }} />);
    expect(screen.getByText(/sticky/i)).toBeTruthy();
  });

  it('does not show sticky badge for regular posts', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.queryByText(/sticky/i)).toBeNull();
  });

  it('shows sticky badge when variant is sticky', () => {
    render(<PostCard post={mockPost} variant="sticky" />);
    expect(screen.getByText(/sticky/i)).toBeTruthy();
  });
});
