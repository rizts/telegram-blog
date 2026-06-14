# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Add build-time arguments for NEXT_PUBLIC_ variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BLOG_TITLE
ARG NEXT_PUBLIC_BLOG_DESCRIPTION
ARG NEXT_PUBLIC_BLOG_SUBTITLE
ARG NEXT_PUBLIC_DOWNLOAD_ANDROID_URL
ARG NEXT_PUBLIC_DOWNLOAD_IOS_URL
ARG NEXT_PUBLIC_RADIO_STREAM_URL
ARG NEXT_PUBLIC_ANNOUNCEMENT_TEXT
ARG NEXT_PUBLIC_SOCIAL_INSTAGRAM
ARG NEXT_PUBLIC_SOCIAL_YOUTUBE
ARG NEXT_PUBLIC_SOCIAL_X
ARG NEXT_PUBLIC_SOCIAL_FACEBOOK

# Set environment variables for build time
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BLOG_TITLE=$NEXT_PUBLIC_BLOG_TITLE \
    NEXT_PUBLIC_BLOG_DESCRIPTION=$NEXT_PUBLIC_BLOG_DESCRIPTION \
    NEXT_PUBLIC_BLOG_SUBTITLE=$NEXT_PUBLIC_BLOG_SUBTITLE \
    NEXT_PUBLIC_DOWNLOAD_ANDROID_URL=$NEXT_PUBLIC_DOWNLOAD_ANDROID_URL \
    NEXT_PUBLIC_DOWNLOAD_IOS_URL=$NEXT_PUBLIC_DOWNLOAD_IOS_URL \
    NEXT_PUBLIC_RADIO_STREAM_URL=$NEXT_PUBLIC_RADIO_STREAM_URL \
    NEXT_PUBLIC_ANNOUNCEMENT_TEXT=$NEXT_PUBLIC_ANNOUNCEMENT_TEXT \
    NEXT_PUBLIC_SOCIAL_INSTAGRAM=$NEXT_PUBLIC_SOCIAL_INSTAGRAM \
    NEXT_PUBLIC_SOCIAL_YOUTUBE=$NEXT_PUBLIC_SOCIAL_YOUTUBE \
    NEXT_PUBLIC_SOCIAL_X=$NEXT_PUBLIC_SOCIAL_X \
    NEXT_PUBLIC_SOCIAL_FACEBOOK=$NEXT_PUBLIC_SOCIAL_FACEBOOK

# Build the Next.js application
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Don't run production containers as root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverage output traces to only copy required files
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Server.js is created by Next.js standalone build automatically
CMD ["node", "server.js"]
