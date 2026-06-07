# Telegram Blog

A blog application that retrieves all posts from a public Telegram channel, stores them in a Neon.tech database (PostgreSQL), and displays them via a Next.js frontend with SSR/ISR.

## Project Structure

This project is divided into two main layers:
1. **backend**: Built with Node.js, Fastify, Drizzle ORM, and node-telegram-bot-api.
2. **frontend**: Built with Next.js 15 using App Router and Tailwind CSS.

---

## Key Features

- **Real-time Synchronization**: Automatically imports new Telegram Channel posts into the blog database.
- **Telegram-Native Sticky & Deletion Sync**: Automatically syncs pinned channel posts to the blog's hero/pinned section and soft-deletes posts from the blog when they are deleted from the Telegram channel.
- **Forward-based Backfilling (Lockable)**: Enables importing of historical posts by forwarding them to the bot's private chat. This feature can be locked via env to prevent spam.
- **Token Authentication**: Critical administrative actions (such as manual pinning/unpinning posts) are secured using an `ADMIN_SECRET` Bearer token.
- **Dynamic Branding**: Completely customizable metadata, title, and header subtitle via environment variables for easy white-labeling.
- **On-Demand ISR Revalidation**: Built-in API route (`/api/revalidate`) allowing caching systems or webhook triggers to update static pages on demand.
- **App Download Links**: Conditionally renders header links with brand SVGs for Android and iOS apps when valid URLs are supplied.
- **Media Preview via Telegram CDN Proxy**: Safely fetches and streams Telegram attachments (photos, videos, documents) natively through the backend without exposing the bot token to the frontend.
- **Dynamic Channel Logo**: Automatically retrieves and caches the channel's profile picture using the Telegram API to display on the blog header.
- **Artistic Redesign**: A warm, responsive, and visually appealing user interface utilizing tailored typography (Inter and Lora) and glassmorphic card layouts.
- **Two-Column Layout & Sidebar**: Modern 70/30 split layout with a robust right sidebar holding interactive widgets.
- **Analytics & View Tracking**: Built-in view counter for posts to determine and showcase "Popular" articles.
- **Auto Categorization**: Extracts hashtags from Telegram messages using Regex to automatically build a topic Tag Cloud.
- **Search & Filtering**: Full-text search support alongside topic/tag-based filtering on the main feed.
- **Dynamic Widgets**:
  - **Online Radio Player**: Interactive HTML5 streaming player embedded in the sidebar.
  - **Channel Stats**: Displays live subscriber count and bio directly from the Telegram channel.
  - **Announcements**: Configurable static announcement box for campaigns/donations.
  - **Social Links**: Centralized social media icons.
  - **App Download Links**: Conditionally renders buttons for Android/iOS companion apps.
---

## Environment Variables (`.env`)

> [!IMPORTANT]
> All environment variables for this project must be stored in a `.env` file within **each respective layer** (not in the root folder).

### 1. Backend (`backend/.env`)
Copy the `backend/.env.example` file to `backend/.env` and configure the following variables:
* `BOT_TOKEN`: Your Telegram bot token obtained from [@BotFather](https://t.me/BotFather).
* `CHANNEL_USERNAME`: The username of your public Telegram channel (e.g., `@yourchannel`).
* `DATABASE_URL`: Your PostgreSQL database connection URI (e.g., from Neon.tech).
* `PORT`: The Fastify server port (default: `3001`).
* `FRONTEND_URL`: The frontend application URL, used for CORS configuration.
* `NODE_ENV`: The environment mode (`development`, `production`, or `test`).
* `ALLOW_FORWARD_SYNC`: Set to `true` to allow manual import of historical posts by forwarding messages to the bot's private chat. Set to `false` in production to prevent spam. Note: Auto-saving of new channel posts is disabled while this flag is `true`.
* `ADMIN_SECRET`: A secret string used to protect admin endpoints (e.g., toggling sticky posts).

### 2. Frontend (`frontend/.env`)
Copy the `frontend/.env.example` file to `frontend/.env` and configure the following variables:
* `NEXT_PUBLIC_API_URL`: The backend API URL (default: `http://localhost:3001`).
* `NEXT_PUBLIC_BLOG_TITLE`: Custom title for the blog layout.
* `NEXT_PUBLIC_BLOG_DESCRIPTION`: Custom meta description for SEO.
* `NEXT_PUBLIC_BLOG_SUBTITLE`: Custom header subtitle.
* `NEXT_PUBLIC_ADMIN_SECRET`: The secret string matching backend's `ADMIN_SECRET` to authorize administrative UI actions (e.g., toggling sticky posts).
* `NEXT_PUBLIC_DOWNLOAD_ANDROID_URL`: Optional download URL for the Android companion app (only displayed in layout if it is a valid HTTP/HTTPS URL).
* `NEXT_PUBLIC_DOWNLOAD_IOS_URL`: Optional download URL for the iOS companion app (only displayed in layout if it is a valid HTTP/HTTPS URL).
* `NEXT_PUBLIC_RADIO_STREAM_URL`: Optional streaming URL for the online radio widget.
* `NEXT_PUBLIC_ANNOUNCEMENT_TEXT`: Optional static text for the announcement box in the sidebar.
* `NEXT_PUBLIC_SOCIAL_INSTAGRAM`: Optional URL for the Instagram social link.
* `NEXT_PUBLIC_SOCIAL_YOUTUBE`: Optional URL for the YouTube social link.
* `NEXT_PUBLIC_SOCIAL_X`: Optional URL for the X (Twitter) social link.
* `NEXT_PUBLIC_SOCIAL_FACEBOOK`: Optional URL for the Facebook social link.

---

## Running Unit Tests

Each layer has its own testing configuration and uses Vitest.

### Backend
```bash
cd backend
npm run test
```

### Frontend
```bash
cd frontend
npm run test
```

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**: Create a fork of this repository on GitHub.
2. **Clone the Fork**: Clone the fork to your local machine.
3. **Create a Branch**: Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes**: Implement your changes and ensure all unit tests pass:
   ```bash
   npm --prefix backend run test
   npm --prefix frontend run test
   ```
5. **Commit & Push**: Commit your changes and push them to your fork:
   ```bash
   git add .
   git commit -m "feat(scope): describe your changes"
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**: Submit a Pull Request explaining your changes.

---

## License

This project is licensed under the [MIT License](LICENSE).
