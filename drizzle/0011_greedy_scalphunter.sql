CREATE TABLE "community_post_comment_likes" (
	"user_id" text NOT NULL,
	"comment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_post_comment_likes_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "feed_post_comment_likes" (
	"user_id" text NOT NULL,
	"comment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feed_post_comment_likes_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
ALTER TABLE "community_post_comment_likes" ADD CONSTRAINT "community_post_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post_comment_likes" ADD CONSTRAINT "community_post_comment_likes_comment_id_community_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comment_likes" ADD CONSTRAINT "feed_post_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comment_likes" ADD CONSTRAINT "feed_post_comment_likes_comment_id_feed_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."feed_post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_post_comment_likes_comment_id" ON "community_post_comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_feed_post_comment_likes_comment_id" ON "feed_post_comment_likes" USING btree ("comment_id");