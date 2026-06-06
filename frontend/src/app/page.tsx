import { StickySection } from '../components/StickySection';
import { PostCard } from '../components/PostCard';
import type { PaginatedResponse } from '../types/post';
import Link from 'next/link';

export const revalidate = 60; // ISR revalidate every 60 seconds

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || '1'));
  const limit = 10;

  let data: PaginatedResponse | null = null;
  let errorMsg: string | null = null;

  try {
    const res = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    data = await res.json();
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    errorMsg = err.message || 'Something went wrong while loading posts.';
  }

  if (errorMsg || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-5 text-center my-8">
        <h2 className="font-semibold text-lg mb-2">Failed to Load Blog Posts</h2>
        <p className="text-sm">{errorMsg || 'Database connection could not be established.'}</p>
      </div>
    );
  }

  const { sticky = [], data: regularPosts = [], meta } = data;

  return (
    <div className="space-y-12">
      {/* Pinned/Sticky Posts Section */}
      {page === 1 && <StickySection posts={sticky} />}

      {/* Regular Posts Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-500">Daftar Posting</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        {regularPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            Belum ada postingan regular.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regularPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block group">
                <PostCard post={post} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pagination Navigation */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100">
          {page > 1 ? (
            <Link
              href={`/?page=${page - 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors"
            >
              ← Sebelumnya
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-100 text-gray-300 rounded-lg text-sm font-medium cursor-not-allowed">
              ← Sebelumnya
            </span>
          )}

          <span className="text-sm text-gray-500">
            Halaman {page} dari {meta.totalPages}
          </span>

          {page < meta.totalPages ? (
            <Link
              href={`/?page=${page + 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors"
            >
              Selanjutnya →
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-100 text-gray-300 rounded-lg text-sm font-medium cursor-not-allowed">
              Selanjutnya →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
