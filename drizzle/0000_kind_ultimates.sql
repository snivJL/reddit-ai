CREATE TABLE IF NOT EXISTS "reddit-ai_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"content" text,
	"author_id" integer NOT NULL,
	"upvotes" integer DEFAULT 0,
	"media_url" varchar(512),
	"media_type" varchar(10),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "reddit-ai_post" USING btree ("name");