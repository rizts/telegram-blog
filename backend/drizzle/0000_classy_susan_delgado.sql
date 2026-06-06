CREATE TABLE IF NOT EXISTS "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_message_id" integer NOT NULL,
	"channel_username" text NOT NULL,
	"content" text,
	"media_url" text,
	"media_type" text,
	"forwarded_from" text,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_sticky" boolean DEFAULT false NOT NULL,
	CONSTRAINT "posts_telegram_message_id_unique" UNIQUE("telegram_message_id")
);
