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
