# Telegram Blog

A unified, serverless-ready blog application that automatically retrieves and displays posts from a public Telegram channel. It stores posts and live status in a Neon.tech database (PostgreSQL) and serves them via a Next.js App Router frontend with stateless API Routes.

This project has been fully migrated from a two-layer monorepo structure into a single, unified Next.js application, making it extremely easy to run locally and deploy to serverless platforms like Vercel.

---

## Key Features

- **Single Application Architecture**: Merged Fastify backend and Next.js frontend into a unified codebase.
- **Stateless Live Stream Status**: Detects video chat starts/ends in your channel via Telegram webhook and persists the status statefully in the database (`channel_metadata` table).
- **Automatic Sync & Webhook**: Receives updates in real-time from Telegram through securely validated webhook routes.
- **Sticky & Deletion Sync**: Synchronizes pinned messages to the hero section and automatically soft-deletes posts when they are deleted from the Telegram channel.
- **CDN Media Proxying**: Securely streams photo, video, and document attachments from Telegram CDN without exposing your bot token.
- **On-Demand Page Revalidation**: Custom API endpoints to instantly invalidate cache.
- **Vercel Cron Compatibility**: A protected `/api/cron/sync` endpoint ready for periodic cron job sync triggers.

---

## Environment Variables (`.env`)

Create a `.env` file in the root directory based on the `.env.example` file:

```env
# Database Configuration
DATABASE_URL=your_neon_postgresql_connection_string

# Telegram Configuration
BOT_TOKEN=your_telegram_bot_token
CHANNEL_USERNAME=@your_channel_username

# Admin Setup
ADMIN_SECRET=your_secure_random_string
WEBHOOK_URL=https://your-domain.com

# Next.js Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BLOG_TITLE="Radio Faedah Kita"
NEXT_PUBLIC_BLOG_SUBTITLE="Saluran Informasi & Kajian"

# Sidebar Extras (Instagram, YouTube, X, Facebook, Announcements)
...
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate and Run Database Migrations
Generate SQL schema changes and push them to your database:
```bash
# Generate SQL
npm run db:generate

# Execute Migrations on Neon
npm run db:migrate
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Setup & Maintenance Endpoints

### 1. Telegram Webhook Setup
To register your app with Telegram to start receiving new posts, trigger the setup route once in your browser or curl:
```
GET http://localhost:3000/api/bot/setup?secret=<your_admin_secret>
```

### 2. Manual/Cron Sync Trigger
To run deletion checking and sticky post updates periodically, set up a cron job pointing to:
```
GET http://localhost:3000/api/cron/sync
Authorization: Bearer <your_admin_secret_or_cron_secret>
```

---

## Building and Running in Production

To build the optimized Next.js production build:
```bash
npm run build
npm start
```
You can also run this using the included multi-stage `Dockerfile`.
