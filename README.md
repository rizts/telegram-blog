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

Create a `.env` file in the root directory. You can copy `.env.example` as a template:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Postgres Database Connection URI. | `postgresql://...` |
| `BOT_TOKEN` | Telegram Bot Token from [@BotFather](https://t.me/BotFather). | `8713274923:AA...` |
| `CHANNEL_USERNAME` | The username of your public Telegram channel (starts with `@`). | `@RuangFaedah_Kita` |
| `ALLOW_FORWARD_SYNC` | Toggle (`true`/`false`) to allow historical message backfilling by forwarding to the bot's private chat. | `true` |
| `ADMIN_SECRET` | Secure random string to authorize admin endpoints (sticky toggling/webhook setup). | `your-secure-secret` |
| `WEBHOOK_URL` | Deployed URL of your website (used to register Telegram Webhook). | `https://your-domain.com` |
| `CRON_SECRET` | Secret to secure automatic Vercel cron triggers. | `your-cron-secret` |
| `NEXT_PUBLIC_API_URL` | The absolute URL pointing to your API routes. | `http://localhost:3000/api` |
| `NEXT_PUBLIC_BLOG_TITLE` | Header brand title. | `"Radio Faedah Kita"` |
| `NEXT_PUBLIC_BLOG_SUBTITLE` | Header brand subtitle. | `"Saluran Informasi & Kajian"` |

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate and Run Database Migrations
Configure your `DATABASE_URL` in `.env`, then run:
```bash
# Generate SQL migration files
npm run db:generate

# Execute migrations to update DB schema
npm run db:migrate
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Running Tests
We use Vitest for component and hook unit testing:
```bash
npm run test
```

---

## Webhook & Cron Setup (Serverless)

### 1. Webhook Setup
To register your app with Telegram to start receiving new posts, trigger the setup route once in your browser or curl after deployment:
```
GET https://<your-domain>/api/bot/setup?secret=<your_admin_secret>
```
*Note: This tells Telegram to send all channel update payloads directly to `https://<your-domain>/api/bot/<bot_token>`.*

### 2. Deletions & Pinned Post Sync (Cron Job)
To periodically check if posts were deleted or pinned directly on Telegram, set up a Cron Job pointing to:
```
GET https://<your-domain>/api/cron/sync
Authorization: Bearer <your_cron_secret_or_admin_secret>
```

#### Vercel Cron Configuration (`vercel.json`)
You can add a `vercel.json` file to the root directory to define the cron interval:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Deployment Guides

### 1. Deploying to Vercel (Recommended)
1. Push your code to your GitHub/GitLab repository.
2. Import the project into your Vercel Dashboard.
3. Configure all Environment Variables in Vercel settings (do NOT prepend backend-only tokens with `NEXT_PUBLIC_` for security).
4. Vercel will auto-detect Next.js and build it.
5. Once deployed, run the **Webhook Setup** step above.

### 2. Deploying via Docker (Self-Hosted Standalone)
We use a multi-stage Docker build that generates a highly optimized standalone Next.js image:

```bash
# Build the Docker image
docker build --build-arg NEXT_PUBLIC_API_URL=https://your-domain.com/api -t telegram-blog .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e BOT_TOKEN="your-bot-token" \
  -e CHANNEL_USERNAME="@your-channel" \
  -e ADMIN_SECRET="your-secret" \
  telegram-blog
```
