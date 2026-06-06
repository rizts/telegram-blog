import type { Post } from '../types/post';
import { PostCard } from './PostCard';

interface Props {
  posts: Post[];
}

export function StickySection({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-amber-700">📌 Disematkan</span>
        <div className="flex-1 h-px bg-amber-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} variant="sticky" />
        ))}
      </div>
    </section>
  );
}
