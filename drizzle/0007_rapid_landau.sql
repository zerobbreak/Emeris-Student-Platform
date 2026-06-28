ALTER TABLE "community_post_comments" ADD COLUMN "reply_to_id" text;--> statement-breakpoint
ALTER TABLE "feed_post_comments" ADD COLUMN "reply_to_id" text;