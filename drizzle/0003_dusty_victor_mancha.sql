CREATE TYPE "public"."community_post_kind" AS ENUM('project', 'assistance', 'tip');--> statement-breakpoint
CREATE TYPE "public"."hive_project_status" AS ENUM('idea', 'planning', 'development', 'testing', 'completed');--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"kind" "community_post_kind" NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" text NOT NULL,
	"tags" text[] NOT NULL,
	"image_url" text,
	"project_id" text,
	"project_title" varchar(200),
	"project_status" "hive_project_status",
	"technologies" text[],
	"assistance_area" varchar(200),
	"tip_focus" varchar(200),
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_posts_author_id" ON "community_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_community_posts_kind" ON "community_posts" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_community_posts_created_at" ON "community_posts" USING btree ("created_at");