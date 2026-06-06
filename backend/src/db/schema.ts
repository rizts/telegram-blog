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
