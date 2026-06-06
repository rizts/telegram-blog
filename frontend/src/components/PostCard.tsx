import type { Post } from '../types/post';

interface Props {
  post: Post;
  variant?: 'default' | 'sticky';
}

export function PostCard({ post, variant = 'default' }: Props) {
  const date = new Date(post.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const isSticky = variant === 'sticky' || post.isSticky;

  return (
    <article className={`bg-white border rounded-xl p-5 transition-colors hover:border-gray-300
      ${isSticky ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isSticky && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">
            📌 Sticky
          </span>
        )}
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
          @{post.channelUsername}
        </span>
        <time className="text-xs text-gray-400">{date}</time>
      </div>

      {post.content && (
        <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
          {post.content}
        </p>
      )}

      {post.mediaType === 'photo' && post.mediaUrl && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          📷 Ada lampiran foto
        </div>
      )}
    </article>
  );
}
