# Telegram Blog

A blog application that retrieves all posts from a public Telegram channel, stores them in a Neon.tech database (PostgreSQL), and displays them via a Next.js frontend with SSR/ISR.

## Project Structure

This project is divided into two main layers:
1. **backend**: Built with Node.js, Fastify, Drizzle ORM, and node-telegram-bot-api.
2. **frontend**: Built with Next.js 15 using App Router and Tailwind CSS.

---

## Environment Variables (`.env`)

> [!IMPORTANT]
> All environment variables for this project must be stored in a `.env` file within **each respective layer** (not in the root folder).

### 1. Backend (`backend/.env`)
Copy the `backend/.env.example` file to `backend/.env` and configure the following variables:
* `BOT_TOKEN`: Your Telegram bot token obtained from [@BotFather](https://t.me/BotFather).
* `CHANNEL_USERNAME`: The username of your public Telegram channel (e.g., `@yourchannel`).
* `DATABASE_URL`: Your PostgreSQL database connection URI from Neon.tech.
* `PORT`: The Fastify server port (default: `3001`).
* `FRONTEND_URL`: The frontend application URL, used for CORS configuration.
* `NODE_ENV`: The environment mode (`development`, `production`, or `test`).

### 2. Frontend (`frontend/.env`)
Copy the `frontend/.env.example` file to `frontend/.env` and configure the following variables:
* `NEXT_PUBLIC_API_URL`: The backend API URL (default: `http://localhost:3001`).

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
