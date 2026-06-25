import { eq } from "drizzle-orm";

import type { Database } from "@/lib/db/client";
import { feedPostComments, feedPosts, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/utils/password";

import { seedFeedPosts, seedFeedUsers } from "./feed";

const SEED_USER_PASSWORD = "SeedUser123!";

export async function seedFeed(db: Database) {
  const existingPost = await db.query.feedPosts.findFirst();
  if (existingPost) {
    console.log("Feed posts already seeded, skipping");
    return;
  }

  const passwordHash = await hashPassword(SEED_USER_PASSWORD);
  const userIdByEmail = new Map<string, string>();

  for (const seedUser of seedFeedUsers) {
    const email = seedUser.email.toLowerCase();
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      userIdByEmail.set(email, existing.id);
      continue;
    }

    const [inserted] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: seedUser.name,
        course: seedUser.course,
        year: seedUser.year,
        bio: seedUser.bio,
        isOnboarded: true,
        role: "student",
      })
      .returning({ id: users.id });

    userIdByEmail.set(email, inserted.id);
  }

  for (const seedPost of seedFeedPosts) {
    const authorId = userIdByEmail.get(seedPost.authorEmail.toLowerCase());
    if (!authorId) {
      throw new Error(`Missing seed author: ${seedPost.authorEmail}`);
    }

    const [post] = await db
      .insert(feedPosts)
      .values({
        authorId,
        text: seedPost.text,
        imageUrl: seedPost.imageUrl ?? null,
        likeCount: seedPost.likeCount,
        dislikeCount: seedPost.dislikeCount,
        commentCount: seedPost.comments.length,
        createdAt: new Date(seedPost.createdAt),
        updatedAt: new Date(seedPost.createdAt),
      })
      .returning({ id: feedPosts.id });

    for (const seedComment of seedPost.comments) {
      const commentAuthorId = userIdByEmail.get(
        seedComment.authorEmail.toLowerCase(),
      );
      if (!commentAuthorId) {
        throw new Error(`Missing seed comment author: ${seedComment.authorEmail}`);
      }

      await db.insert(feedPostComments).values({
        postId: post.id,
        authorId: commentAuthorId,
        text: seedComment.text,
        likeCount: seedComment.likeCount,
        dislikeCount: seedComment.dislikeCount,
        likedByCreator: seedComment.likedByCreator,
        createdAt: new Date(seedComment.createdAt),
      });
    }
  }

  console.log(
    `Seeded ${seedFeedPosts.length} feed posts with comments for ${seedFeedUsers.length} users`,
  );
}
