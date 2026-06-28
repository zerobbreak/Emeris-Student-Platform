CREATE TABLE "community_post_comment_dislikes" (
	"user_id" text NOT NULL,
	"comment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_post_comment_dislikes_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "community_post_dislikes" (
	"user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_post_dislikes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "feed_post_comment_dislikes" (
	"user_id" text NOT NULL,
	"comment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feed_post_comment_dislikes_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "feed_post_dislikes" (
	"user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feed_post_dislikes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "dislike_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "community_post_comment_dislikes" ADD CONSTRAINT "community_post_comment_dislikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post_comment_dislikes" ADD CONSTRAINT "community_post_comment_dislikes_comment_id_community_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post_dislikes" ADD CONSTRAINT "community_post_dislikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post_dislikes" ADD CONSTRAINT "community_post_dislikes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comment_dislikes" ADD CONSTRAINT "feed_post_comment_dislikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comment_dislikes" ADD CONSTRAINT "feed_post_comment_dislikes_comment_id_feed_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."feed_post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_dislikes" ADD CONSTRAINT "feed_post_dislikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_dislikes" ADD CONSTRAINT "feed_post_dislikes_post_id_feed_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."feed_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_post_comment_dislikes_comment_id" ON "community_post_comment_dislikes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_community_post_dislikes_post_id" ON "community_post_dislikes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_feed_post_comment_dislikes_comment_id" ON "feed_post_comment_dislikes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_feed_post_dislikes_post_id" ON "feed_post_dislikes" USING btree ("post_id");