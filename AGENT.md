# AGENT.md — Telegram Blog: Build & Deploy Guide

Dokumen ini adalah instruksi lengkap untuk AI agent dalam membangun, menguji, dan men-deploy
**Telegram Channel Blog** — sebuah blog yang menarik seluruh post dari channel Telegram publik
dan menyimpannya ke database, lalu menampilkannya via frontend Next.js dengan SSR/ISR.

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Folder Project](#3-struktur-folder-project)
4. [Setup Awal](#4-setup-awal)
5. [Backend — Sync Service](#5-backend--sync-service)
6. [Database — Neon.tech](#6-database--neontech)
7. [Frontend — Next.js Blog](#7-frontend--nextjs-blog)
8. [Unit Testing](#8-unit-testing)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Environment Variables](#10-environment-variables)
11. [Urutan Deploy](#11-urutan-deploy)

---

## 1. Arsitektur Sistem

```
┌─────────────────────┐
│   Telegram Channel  │
│   (public posts)    │
└────────┬────────────┘
         │ Bot API (getHistory, pagination)
         ▼
┌─────────────────────┐        ┌─────────────────────┐
│   Backend Sync      │◄──────►│   Neon.tech          │
│   (Node.js/Fastify) │  SQL   │   (PostgreSQL DB)    │
│   deploy: Render    │        │                     │
└─────────────────────┘        └──────────┬──────────┘
                                          │ REST API / direct query
                                          ▼
                               ┌─────────────────────┐
                               │   Frontend Blog     │
                               │   (Next.js SSR/ISR)    │
                               │   deploy: Vercel    │
                               └─────────────────────┘
```

**Alur kerja:**
- Backend berjalan di Render, melakukan sync awal seluruh post via Telegram Bot API
- Setelah sync awal selesai, backend menjalankan polling/webhook untuk post baru
- Semua post tersimpan di Neon.tech PostgreSQL
- Frontend Next.js di Vercel fetch data di server (SSR/ISR), konten langsung ada di HTML

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| **Backend** | Node.js 20 + Fastify | Performa tinggi, schema validation built-in |
| **ORM** | Drizzle ORM | Type-safe, cocok untuk Neon/serverless |
| **Database** | Neon.tech (PostgreSQL) | Gratis, serverless-ready, branching |
| **Bot** | `node-telegram-bot-api` | Mature, support polling & webhook |
| **Frontend** | Next.js 15 (App Router) | SSR/ISR built-in, SEO-friendly, zero-config Vercel deploy |
| **Styling** | Tailwind CSS v4 | Utility-first, native CSS variables |
| **Testing (backend)** | Vitest + Fastify inject | Fast, native ESM, tanpa server listen |
| **Testing (frontend)** | Jest + React Testing Library | Standar de-facto untuk Next.js |
| **CI/CD** | GitHub Actions | Gratis untuk public repo |
| **Deploy Backend** | Render.com (Free tier) | Mudah, support Node.js |
| **Deploy Frontend** | Vercel | Zero-config React deploy |
| **Deploy DB** | Neon.tech | Managed PostgreSQL gratis |

---

## 3. Struktur Folder Project

```
telegram-blog/
├── AGENT.md                    # File ini
├── .github/
│   └── workflows/
│       ├── ci.yml              # Test & lint pada setiap PR
│       └── deploy.yml          # Deploy ke Render + Vercel setelah merge ke main
├── backend/
│   ├── src/
│   │   ├── index.ts            # Entry point Fastify server
│   │   ├── bot/
│   │   │   ├── client.ts       # Inisialisasi Telegram bot
│   │   │   └── sync.ts         # Logic fetch & sync semua post
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema (tabel posts)
│   │   │   ├── migrate.ts      # Script jalankan migrasi
│   │   │   └── client.ts       # Neon connection pool
│   │   ├── routes/
│   │   │   └── posts.ts        # GET /posts, GET /posts/:id
│   │   └── utils/
│   │       └── parser.ts       # Parse Telegram message → post object
│   ├── tests/
│   │   ├── sync.test.ts
│   │   ├── parser.test.ts
│   │   └── routes.test.ts
│   ├── drizzle/                # Generated migration files
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout + metadata global
│   │   │   ├── page.tsx                # Halaman utama (ISR) — sticky + daftar post
│   │   │   ├── posts/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Detail post (SSR per request)
│   │   │   └── api/
│   │   │       └── revalidate/
│   │   │           └── route.ts        # Webhook endpoint untuk trigger ISR revalidation
│   │   ├── components/
│   │   │   ├── PostCard.tsx            # Server component (default)
│   │   │   ├── PostList.tsx            # Server component
│   │   │   ├── StickySection.tsx       # Server component — hero/sidebar sticky posts
│   │   │   ├── Pagination.tsx          # Client component ('use client')
│   │   │   └── StickyToggle.tsx        # Client component — tombol toggle sticky
│   │   ├── lib/
│   │   │   └── api.ts                  # Fetch helpers (server-side)
│   │   └── types/
│   │       └── post.ts
│   ├── __tests__/
│   │   ├── PostCard.test.tsx
│   │   ├── StickySection.test.tsx
│   │   └── api.test.ts
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── jest.config.ts
│   └── .env.example
└── README.md
```

---

## 4. Setup Awal

### 4.1 Buat Telegram Bot

1. Chat [@BotFather](https://t.me/BotFather) di Telegram
2. Ketik `/newbot`, ikuti instruksi, dapatkan **BOT_TOKEN**
3. Tambahkan bot ke channel sebagai **Administrator** (minimal permission: Read Messages)
4. Dapatkan **CHANNEL_USERNAME** (contoh: `@namachannel`) atau **CHANNEL_ID** (angka negatif)

Untuk mendapatkan CHANNEL_ID:
```
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```
Kirim satu pesan ke channel, lalu lihat nilai `chat.id` di response JSON.

### 4.2 Setup Neon.tech

1. Daftar di [neon.tech](https://neon.tech), buat project baru
2. Buat database dengan nama `telegram_blog`
3. Salin **Connection String** format:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/telegram_blog?sslmode=require
   ```
4. Simpan sebagai `DATABASE_URL` di environment variables

### 4.3 Install Dependencies

```bash
# Backend
cd backend
npm install fastify @fastify/cors dotenv drizzle-orm @neondatabase/serverless
npm install node-telegram-bot-api
npm install -D typescript ts-node @types/node
npm install -D vitest
npm install -D drizzle-kit

# Frontend
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
npm install
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

---

## 5. Backend — Sync Service

### 5.1 Database Schema (`backend/src/db/schema.ts`)

```typescript
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  telegramMessageId: integer('telegram_message_id').notNull().unique(),
  channelUsername: text('channel_username').notNull(),
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),           // 'photo' | 'video' | 'document' | null
  forwardedFrom: text('forwarded_from'),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  isSticky: boolean('is_sticky').default(false).notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### 5.2 Neon DB Client (`backend/src/db/client.ts`)

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 5.3 Telegram Sync (`backend/src/bot/sync.ts`)

```typescript
import TelegramBot from 'node-telegram-bot-api';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { parseMessage } from '../utils/parser';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

/**
 * Sync seluruh history channel dari awal.
 * Telegram Bot API tidak mendukung getHistory langsung,
 * workaround: forward semua pesan ke bot private untuk capture,
 * atau gunakan offset-based forwardMessages.
 *
 * Pendekatan yang digunakan: fetch via getChatHistory menggunakan
 * MTProto-compatible offset. Untuk Bot API standar, kita simpan
 * offset dari polling dan lakukan initial sync via webhook replay.
 */
export async function syncAllPosts(channelId: string): Promise<number> {
  let synced = 0;
  let offset = 0;
  const limit = 100;

  // Catatan: Telegram Bot API standar tidak expose getHistory.
  // Gunakan pendekatan: jalankan bot dengan polling dari offset 0
  // untuk menangkap semua update yang belum dibaca.
  // Untuk archive lengkap, pertimbangkan GramJS (lihat catatan di bawah).

  console.log(`[sync] Starting sync for channel: ${channelId}`);

  await bot.startPolling();

  bot.on('channel_post', async (msg) => {
    if (msg.chat.username !== channelId.replace('@', '')) return;
    const parsed = parseMessage(msg, channelId);
    await upsertPost(parsed);
    synced++;
  });

  // Polling berjalan sebagai background process
  return synced;
}

async function upsertPost(post: any) {
  await db
    .insert(posts)
    .values(post)
    .onConflictDoUpdate({
      target: posts.telegramMessageId,
      set: { content: post.content, updatedAt: new Date() },
    });
}

export async function stopSync() {
  await bot.stopPolling();
}
```

> **Catatan penting:** Telegram Bot API standar hanya bisa menangkap post **sejak bot pertama kali ditambahkan**. Untuk fetch post lama sebelum bot ditambahkan, gunakan **GramJS** (MTProto) sebagai one-time script initial sync. Setelah sync awal selesai, Bot API sudah cukup untuk polling post baru.

### 5.4 Message Parser (`backend/src/utils/parser.ts`)

```typescript
import type { Message } from 'node-telegram-bot-api';
import type { NewPost } from '../db/schema';

export function parseMessage(msg: Message, channelUsername: string): NewPost {
  let mediaUrl: string | null = null;
  let mediaType: string | null = null;

  if (msg.photo) {
    const largest = msg.photo[msg.photo.length - 1];
    mediaUrl = largest.file_id;
    mediaType = 'photo';
  } else if (msg.video) {
    mediaUrl = msg.video.file_id;
    mediaType = 'video';
  } else if (msg.document) {
    mediaUrl = msg.document.file_id;
    mediaType = 'document';
  }

  return {
    telegramMessageId: msg.message_id,
    channelUsername: channelUsername.replace('@', ''),
    content: msg.text ?? msg.caption ?? null,
    mediaUrl,
    mediaType,
    forwardedFrom: msg.forward_from_chat?.title ?? null,
    publishedAt: new Date(msg.date * 1000),
  };
}
```

### 5.5 API Routes (`backend/src/routes/posts.ts`)

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { posts } from '../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /posts?page=1&limit=10
  // Mengembalikan sticky posts (semua, tanpa paginasi) + regular posts (dengan paginasi)
  fastify.get<{ Querystring: { page?: string; limit?: string } }>('/', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1'));
    const limit = Math.min(50, parseInt(request.query.limit ?? '10'));
    const offset = (page - 1) * limit;

    const notDeleted = eq(posts.isDeleted, false);

    const [stickyData, regularData, countResult] = await Promise.all([
      // Sticky posts — selalu tampil semua, diurutkan terbaru
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, true)))
        .orderBy(desc(posts.publishedAt)),

      // Regular posts — dengan paginasi, exclude yang sticky
      db
        .select()
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
        .offset(offset),

      // Hitung total regular posts untuk paginasi
      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(notDeleted, eq(posts.isSticky, false))),
    ]);

    return {
      sticky: stickyData,
      data: regularData,
      meta: {
        page,
        limit,
        total: Number(countResult[0].count),
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    };
  });

  // GET /posts/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(request.params.id)))
      .limit(1);

    if (!post.length) {
      reply.status(404);
      return { error: 'Post not found' };
    }

    return post[0];
  });

  // PATCH /posts/:id/sticky — toggle status sticky sebuah post
  fastify.patch<{ Params: { id: string }; Body: { isSticky: boolean } }>(
    '/:id/sticky',
    {
      schema: {
        body: {
          type: 'object',
          required: ['isSticky'],
          properties: {
            isSticky: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      const { isSticky } = request.body;

      const updated = await db
        .update(posts)
        .set({ isSticky, updatedAt: new Date() })
        .where(eq(posts.id, id))
        .returning();

      if (!updated.length) {
        reply.status(404);
        return { error: 'Post not found' };
      }

      return updated[0];
    }
  );
};

export default postsRoutes;
```

### 5.6 Fastify Entry Point (`backend/src/index.ts`)

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import postsRoutes from './routes/posts';
import { syncAllPosts } from './bot/sync';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

fastify.get('/health', async () => ({ status: 'ok' }));
fastify.register(postsRoutes, { prefix: '/posts' });

const PORT = parseInt(process.env.PORT || '3001');

fastify.listen({ port: PORT, host: '0.0.0.0' }, async (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  const channel = process.env.CHANNEL_USERNAME!;
  await syncAllPosts(channel);
  fastify.log.info(`[sync] Bot polling started for ${channel}`);
});

export { fastify };
```

### 5.7 Drizzle Config (`backend/drizzle.config.ts`)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 5.8 `backend/package.json` scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "ts-node src/db/migrate.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 6. Database — Neon.tech

### 6.1 Jalankan Migrasi

```bash
cd backend
cp .env.example .env   # isi DATABASE_URL
npm run db:generate
npm run db:migrate
```

### 6.2 Migration Script (`backend/src/db/migrate.ts`)

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

migrate(db, { migrationsFolder: './drizzle' }).then(() => {
  console.log('[migrate] Done');
  process.exit(0);
});
```

### 6.3 Neon Branching untuk CI

Di GitHub Actions, gunakan Neon branch per PR agar tidak merusak data production:
- Branch `main` → database `main` (production)
- Branch `feature/*` → database branch otomatis via `neon-actions/create-branch`

---

## 7. Frontend — Next.js Blog

### 7.1 Custom Hook (`frontend/src/hooks/usePosts.ts`)

```typescript
import { useState, useEffect } from 'react';
import type { Post, PaginatedResponse } from '../types/post';

const API_URL = import.meta.env.NEXT_PUBLIC_API_URL;

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
        headers: { 'Content-Type': 'application/json' },
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
```

### 7.2 Types (`frontend/src/types/post.ts`)

```typescript
export interface Post {
  id: number;
  telegramMessageId: number;
  channelUsername: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: 'photo' | 'video' | 'document' | null;
  forwardedFrom: string | null;
  publishedAt: string;
  createdAt: string;
  isSticky: boolean;
}

export interface PaginatedResponse {
  sticky: Post[];           // selalu ada, bisa array kosong
  data: Post[];             // regular posts dengan paginasi
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 7.3 PostCard Component (`frontend/src/components/PostCard.tsx`)

```typescript
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
```

### 7.4 StickySection Component (`frontend/src/components/StickySection.tsx`)

Komponen ini menampilkan sticky posts di bagian atas halaman (hero) atau bisa dijadikan sidebar widget.

```typescript
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
```

### 7.4 Vite Config (`frontend/vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
});
```

---

## 8. Unit Testing

### 8.1 Backend Tests

**`backend/tests/parser.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { parseMessage } from '../src/utils/parser';

const mockMsg = (overrides = {}) => ({
  message_id: 123,
  date: 1700000000,
  chat: { id: -1001234567890, type: 'channel', username: 'testchannel' },
  text: 'Hello world',
  ...overrides,
});

describe('parseMessage', () => {
  it('parses text message correctly', () => {
    const result = parseMessage(mockMsg() as any, '@testchannel');
    expect(result.telegramMessageId).toBe(123);
    expect(result.content).toBe('Hello world');
    expect(result.mediaType).toBeNull();
    expect(result.channelUsername).toBe('testchannel');
  });

  it('parses photo message', () => {
    const msg = mockMsg({
      text: undefined,
      caption: 'Caption foto',
      photo: [{ file_id: 'abc123', file_unique_id: 'u1', width: 100, height: 100, file_size: 1000 }],
    });
    const result = parseMessage(msg as any, '@testchannel');
    expect(result.mediaType).toBe('photo');
    expect(result.mediaUrl).toBe('abc123');
    expect(result.content).toBe('Caption foto');
  });

  it('handles forwarded message', () => {
    const msg = mockMsg({
      forward_from_chat: { title: 'Source Channel', id: -999, type: 'channel' },
    });
    const result = parseMessage(msg as any, '@testchannel');
    expect(result.forwardedFrom).toBe('Source Channel');
  });

  it('converts unix timestamp to Date', () => {
    const result = parseMessage(mockMsg() as any, '@testchannel');
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.publishedAt.getTime()).toBe(1700000000 * 1000);
  });
});
```

**`backend/tests/routes.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import postsRoutes from '../src/routes/posts';

const mockStickyPost = { id: 1, content: 'Sticky post', isSticky: true, publishedAt: new Date(), channelUsername: 'test' };
const mockRegularPost = { id: 2, content: 'Regular post', isSticky: false, publishedAt: new Date(), channelUsername: 'test' };

vi.mock('../src/db/client', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ ...mockStickyPost, isSticky: false }]),
    offset: vi.fn().mockResolvedValue([mockRegularPost]),
  },
}));

async function buildApp() {
  const app = Fastify();
  await app.register(postsRoutes, { prefix: '/posts' });
  await app.ready();
  return app;
}

describe('GET /posts', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => { app = await buildApp(); });
  afterEach(async () => { await app.close(); });

  it('returns 200 with sticky and data keys', async () => {
    const res = await app.inject({ method: 'GET', url: '/posts' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('sticky');
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('supports pagination query params', async () => {
    const res = await app.inject({ method: 'GET', url: '/posts?page=2&limit=5' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for unknown post id', async () => {
    const res = await app.inject({ method: 'GET', url: '/posts/99999' });
    expect(res.statusCode).toBe(404);
  });
});

describe('PATCH /posts/:id/sticky', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => { app = await buildApp(); });
  afterEach(async () => { await app.close(); });

  it('toggles sticky to false and returns updated post', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/1/sticky',
      payload: { isSticky: false },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.isSticky).toBe(false);
  });

  it('returns 400 when body is missing isSticky field', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/1/sticky',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for unknown post id', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/posts/99999/sticky',
      payload: { isSticky: true },
    });
    expect(res.statusCode).toBe(404);
  });
});
```

### 8.2 Frontend Tests

**`frontend/tests/PostCard.test.tsx`**
```typescript
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
    expect(screen.queryByRole('paragraph')).toBeNull();
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
```

**`frontend/tests/useStickyToggle.test.ts`**
```typescript
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
```

**`frontend/tests/usePosts.test.ts`**
```typescript
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
```

---

## 9. CI/CD Pipeline

### 9.1 CI — Test & Lint (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    env:
      DATABASE_URL: ${{ secrets.NEON_DATABASE_URL_CI }}
      BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
      CHANNEL_USERNAME: ${{ secrets.TELEGRAM_CHANNEL_USERNAME }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          directory: backend/coverage

  test-frontend:
    name: Frontend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test:coverage

      - name: Build check
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: https://example.com
```

### 9.2 Deploy (`.github/workflows/deploy.yml`)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    name: Deploy Backend to Render
    runs-on: ubuntu-latest
    needs: []   # tambahkan test jobs jika ingin gate

    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
            -H "Content-Type: application/json" \
            -d '{}'

  run-migrations:
    name: Run DB Migrations
    runs-on: ubuntu-latest
    needs: [deploy-backend]
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.NEON_DATABASE_URL_PROD }}

  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    needs: [run-migrations]

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'
```

### 9.3 GitHub Secrets yang Diperlukan

Tambahkan semua ini di **Settings → Secrets and variables → Actions**:

| Secret | Cara mendapatkan |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Dari @BotFather |
| `TELEGRAM_CHANNEL_USERNAME` | Username channel (tanpa @) |
| `NEON_DATABASE_URL_PROD` | Connection string Neon production |
| `NEON_DATABASE_URL_CI` | Connection string Neon branch untuk CI |
| `RENDER_API_KEY` | Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Render Dashboard → Service → Settings (format: `srv-xxx`) |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project settings |

---

## 10. Environment Variables

### `backend/.env.example`

```env
# Telegram
BOT_TOKEN=your_bot_token_here
CHANNEL_USERNAME=@your_channel_username

# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/telegram_blog?sslmode=require

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### `frontend/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 11. Urutan Deploy

Ikuti urutan ini saat deploy pertama kali:

```
1. Setup Neon.tech
   └── Buat project & database
   └── Salin connection string

2. Setup Telegram Bot
   └── Buat bot via @BotFather
   └── Tambahkan ke channel sebagai admin
   └── Salin BOT_TOKEN & CHANNEL_USERNAME

3. Deploy Backend ke Render
   └── Connect GitHub repo
   └── Set Root Directory: backend
   └── Build Command: npm install && npm run build
   └── Start Command: npm start
   └── Tambahkan semua env vars

4. Jalankan Migrasi DB
   └── cd backend && npm run db:migrate

5. Verifikasi Bot Polling
   └── Cek Render logs, pastikan "Bot polling started"
   └── POST satu pesan ke channel, cek apakah masuk ke DB

6. Deploy Frontend ke Vercel
   └── Import GitHub repo
   └── Set Root Directory: frontend
   └── Set NEXT_PUBLIC_API_URL ke URL Render backend

7. Setup GitHub Secrets
   └── Isi semua secrets seperti di bagian 9.3

8. Push ke main → CI/CD berjalan otomatis
```

---

## Catatan Tambahan

### Untuk sync post lama (sebelum bot ditambahkan)

Buat script one-time menggunakan [GramJS](https://github.com/gram-js/gramjs):

```bash
cd backend
npm install telegram input
```

```typescript
// scripts/initial-sync.ts
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

// Jalankan SEKALI SAJA secara lokal, bukan di production
const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {});
await client.start({ phoneNumber: async () => '+62xxx' });

for await (const message of client.iterMessages('@channel', { limit: 10000 })) {
  // simpan ke DB
}
```

### Render cold start mitigation

Tambahkan ping cron gratis via [cron-job.org](https://cron-job.org) setiap 10 menit ke endpoint `/health` agar backend tidak sleep.

### Monitoring

- Render: built-in logs di dashboard
- Neon: query analytics di Neon Console
- Vercel: deployment & function logs di dashboard
```
