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
      <div style={{
        background: 'rgba(255, 235, 235, 0.8)',
        border: '1px solid rgba(220, 150, 150, 0.4)',
        borderRadius: '14px',
        padding: '32px',
        textAlign: 'center',
        margin: '32px 0',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#8b2020', marginBottom: '8px' }}>
          Failed to Load Blog Posts
        </h2>
        <p style={{ fontSize: '14px', color: '#a05050' }}>
          {errorMsg || 'Database connection could not be established.'}
        </p>
      </div>
    );
  }

  const { sticky = [], data: regularPosts = [], meta } = data;

  return (
    <div className="animate-fadeInUp">
      {/* Pinned/Sticky Posts Section */}
      {page === 1 && <StickySection posts={sticky} />}

      {/* Regular Posts Section */}
      <section>
        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
        }}>
          <div style={{
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(139, 105, 20, 0.08)',
            border: '1px solid rgba(139, 105, 20, 0.15)',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
              Daftar Posting
            </span>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(180, 150, 60, 0.3), transparent)' }} />
          {meta.total > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {meta.total} artikel
            </span>
          )}
        </div>

        {regularPosts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            border: '1px dashed rgba(180, 150, 60, 0.3)',
            borderRadius: '14px', color: 'var(--text-muted)',
            fontSize: '14px',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📭</div>
            Belum ada postingan regular.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <PostCard post={post} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', paddingTop: '36px', marginTop: '36px',
          borderTop: '1px solid rgba(180, 150, 60, 0.2)',
        }}>
          {page > 1 ? (
            <Link href={`/?page=${page - 1}`} style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none', color: 'var(--accent-primary)',
              background: 'rgba(139, 105, 20, 0.08)', border: '1px solid rgba(139, 105, 20, 0.2)',
              transition: 'all 0.2s ease',
            }}>
              ← Sebelumnya
            </Link>
          ) : (
            <span style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-muted)', opacity: 0.4, border: '1px solid rgba(180, 150, 60, 0.15)',
            }}>
              ← Sebelumnya
            </span>
          )}

          <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '0 4px' }}>
            Halaman <strong style={{ color: 'var(--accent-primary)' }}>{page}</strong> dari {meta.totalPages}
          </span>

          {page < meta.totalPages ? (
            <Link href={`/?page=${page + 1}`} style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none', color: 'var(--accent-primary)',
              background: 'rgba(139, 105, 20, 0.08)', border: '1px solid rgba(139, 105, 20, 0.2)',
              transition: 'all 0.2s ease',
            }}>
              Selanjutnya →
            </Link>
          ) : (
            <span style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-muted)', opacity: 0.4, border: '1px solid rgba(180, 150, 60, 0.15)',
            }}>
              Selanjutnya →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
