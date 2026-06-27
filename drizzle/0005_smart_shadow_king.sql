CREATE TYPE "public"."resource_type" AS ENUM('article', 'video', 'course', 'tutorial');--> statement-breakpoint
CREATE TABLE "resources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "resource_type" DEFAULT 'article' NOT NULL,
	"url" text NOT NULL,
	"read_time" varchar(50),
	"skill_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_resources_skill_id" ON "resources" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_resources_type" ON "resources" USING btree ("type");