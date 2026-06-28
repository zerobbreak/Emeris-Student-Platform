import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "lecturer",
  "admin",
]);

export const communityPostKindEnum = pgEnum("community_post_kind", [
  "project",
  "assistance",
  "tip",
]);

export const hiveProjectStatusEnum = pgEnum("hive_project_status", [
  "idea",
  "planning",
  "development",
  "testing",
  "completed",
]);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    bio: text("bio"),
    profileImage: text("profile_image"),
    course: varchar("course", { length: 100 }),
    year: integer("year"),
    location: varchar("location", { length: 100 }),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    role: userRoleEnum("role").default("student").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isOnboarded: boolean("is_onboarded").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshToken: text("refresh_token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.userId),
    index("idx_sessions_refresh_token").on(table.refreshToken),
  ],
);

export const skills = pgTable(
  "skills",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 100 }).notNull().unique(),
    category: varchar("category", { length: 50 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_skills_category").on(table.category)],
);

export const resourceTypeEnum = pgEnum("resource_type", [
  "article",
  "video",
  "course",
  "tutorial",
]);

export const resources = pgTable(
  "resources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: resourceTypeEnum("type").default("article").notNull(),
    url: text("url").notNull(),
    readTime: varchar("read_time", { length: 50 }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_resources_skill_id").on(table.skillId),
    index("idx_resources_type").on(table.type),
  ],
);

export const userSkillStatusEnum = pgEnum("user_skill_status", [
  "to_learn",
  "learning",
  "mastered",
]);

export const userSkills = pgTable(
  "user_skills",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    status: userSkillStatusEnum("status").default("to_learn").notNull(),
    endorsementCount: integer("endorsement_count").default(0).notNull(),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_skills_user_skill_idx").on(table.userId, table.skillId),
    index("idx_user_skills_user_id").on(table.userId),
    index("idx_user_skills_skill_id").on(table.skillId),
  ],
);

export const feedPosts = pgTable(
  "feed_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    imageUrl: text("image_url"),
    likeCount: integer("like_count").default(0).notNull(),
    dislikeCount: integer("dislike_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_feed_posts_author_id").on(table.authorId),
    index("idx_feed_posts_created_at").on(table.createdAt),
  ],
);

export const communityPosts = pgTable(
  "community_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: communityPostKindEnum("kind").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: text("excerpt").notNull(),
    tags: text("tags").array().notNull(),
    imageUrl: text("image_url"),
    projectId: text("project_id"),
    projectTitle: varchar("project_title", { length: 200 }),
    projectStatus: hiveProjectStatusEnum("project_status"),
    technologies: text("technologies").array(),
    assistanceArea: varchar("assistance_area", { length: 200 }),
    tipFocus: varchar("tip_focus", { length: 200 }),
    likeCount: integer("like_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_community_posts_author_id").on(table.authorId),
    index("idx_community_posts_kind").on(table.kind),
    index("idx_community_posts_created_at").on(table.createdAt),
  ],
);

export const feedPostComments = pgTable(
  "feed_post_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    postId: text("post_id")
      .notNull()
      .references(() => feedPosts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    dislikeCount: integer("dislike_count").default(0).notNull(),
    likedByCreator: boolean("liked_by_creator").default(false).notNull(),
    replyToId: text("reply_to_id"),
    threadId: text("thread_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_feed_post_comments_post_id").on(table.postId),
    index("idx_feed_post_comments_author_id").on(table.authorId),
  ],
);

export const communityPostComments = pgTable(
  "community_post_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    dislikeCount: integer("dislike_count").default(0).notNull(),
    likedByCreator: boolean("liked_by_creator").default(false).notNull(),
    replyToId: text("reply_to_id"),
    threadId: text("thread_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_community_post_comments_post_id").on(table.postId),
    index("idx_community_post_comments_author_id").on(table.authorId),
  ],
);

export const communityPostLikes = pgTable(
  "community_post_likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.postId] }),
    index("idx_community_post_likes_post_id").on(table.postId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  userSkills: many(userSkills),
  feedPosts: many(feedPosts),
  feedPostComments: many(feedPostComments),
  communityPosts: many(communityPosts),
  communityPostComments: many(communityPostComments),
  communityPostLikes: many(communityPostLikes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  skill: one(skills, {
    fields: [resources.skillId],
    references: [skills.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const feedPostsRelations = relations(feedPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [feedPosts.authorId],
    references: [users.id],
  }),
  comments: many(feedPostComments),
}));

export const feedPostCommentsRelations = relations(
  feedPostComments,
  ({ one, many }) => ({
    post: one(feedPosts, {
      fields: [feedPostComments.postId],
      references: [feedPosts.id],
    }),
    author: one(users, {
      fields: [feedPostComments.authorId],
      references: [users.id],
    }),
    parentComment: one(feedPostComments, {
      fields: [feedPostComments.replyToId],
      references: [feedPostComments.id],
      relationName: "feed_post_replies",
    }),
    replies: many(feedPostComments, {
      relationName: "feed_post_replies",
    }),
    threadRoot: one(feedPostComments, {
      fields: [feedPostComments.threadId],
      references: [feedPostComments.id],
      relationName: "feed_post_thread",
    }),
    threadComments: many(feedPostComments, {
      relationName: "feed_post_thread",
    }),
  }),
);

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [communityPosts.authorId],
    references: [users.id],
  }),
  comments: many(communityPostComments),
  likes: many(communityPostLikes),
}));

export const communityPostLikesRelations = relations(
  communityPostLikes,
  ({ one }) => ({
    post: one(communityPosts, {
      fields: [communityPostLikes.postId],
      references: [communityPosts.id],
    }),
    user: one(users, {
      fields: [communityPostLikes.userId],
      references: [users.id],
    }),
  }),
);

export const communityPostCommentsRelations = relations(
  communityPostComments,
  ({ one, many }) => ({
    post: one(communityPosts, {
      fields: [communityPostComments.postId],
      references: [communityPosts.id],
    }),
    author: one(users, {
      fields: [communityPostComments.authorId],
      references: [users.id],
    }),
    parentComment: one(communityPostComments, {
      fields: [communityPostComments.replyToId],
      references: [communityPostComments.id],
      relationName: "community_post_replies",
    }),
    replies: many(communityPostComments, {
      relationName: "community_post_replies",
    }),
    threadRoot: one(communityPostComments, {
      fields: [communityPostComments.threadId],
      references: [communityPostComments.id],
      relationName: "community_post_thread",
    }),
    threadComments: many(communityPostComments, {
      relationName: "community_post_thread",
    }),
  }),
);
