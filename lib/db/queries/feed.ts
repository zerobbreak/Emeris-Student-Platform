import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feedPostComments, feedPosts } from "@/lib/db/schema";
import {
  StorageError,
  uploadPlatformImage,
} from "@/lib/supabase/storage";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedAuthor, FeedComment, FeedPost } from "@/types/feed";


export class FeedError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FeedError";
  }
}

function mapAuthor(user: {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
}): FeedAuthor {
  return {
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
    course: user.course,
    year: user.year,
  };
}

function mapFeedPost(row: {
  id: string;
  text: string;
  imageUrl: string | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    profileImage: string | null;
    course: string | null;
    year: number | null;
  };
  comments: Array<{
    id: string;
    postId: string;
    text: string;
    likeCount: number;
    dislikeCount: number;
    likedByCreator: boolean;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      profileImage: string | null;
      course: string | null;
      year: number | null;
    };
  }>;
}): FeedPost {
  return {
    id: row.id,
    text: row.text,
    imageUrl: row.imageUrl,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    commentCount: row.commentCount,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
    comments: row.comments.map(
      (comment): FeedComment => ({
        id: comment.id,
        postId: comment.postId,
        text: comment.text,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        likedByCreator: comment.likedByCreator,
        createdAt: comment.createdAt.toISOString(),
        author: mapAuthor(comment.author),
      }),
    ),
  };
}

export async function getFeedPosts(): Promise<FeedPost[]> {
  const rows = await db.query.feedPosts.findMany({
    orderBy: [desc(feedPosts.createdAt)],
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  return rows.map(mapFeedPost);
}

export async function createFeedPost(
  authorId: string,
  input: CreateFeedPostInput,
): Promise<FeedPost> {
  const imageUrl = input.imageUrl?.trim() || null;

  const [inserted] = await db
    .insert(feedPosts)
    .values({
      authorId,
      text: input.text.trim(),
      imageUrl,
    })
    .returning({ id: feedPosts.id });

  const row = await db.query.feedPosts.findFirst({
    where: eq(feedPosts.id, inserted.id),
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!row) {
    throw new FeedError("INTERNAL_ERROR", "Failed to load created post");
  }

  return mapFeedPost(row);
}

export async function getFeedPostById(id: string): Promise<FeedPost | null> {
  const row = await db.query.feedPosts.findFirst({
    where: eq(feedPosts.id, id),
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!row) {
    return null;
  }

  return mapFeedPost(row);
}

export async function createFeedPostComment(
  authorId: string,
  postId: string,
  text: string,
): Promise<FeedComment> {
  const [inserted] = await db
    .insert(feedPostComments)
    .values({
      authorId,
      postId,
      text: text.trim(),
    })
    .returning({ id: feedPostComments.id });

  // Increment commentCount on the post
  const post = await getFeedPostById(postId);
  if (post) {
    await db
      .update(feedPosts)
      .set({ commentCount: post.commentCount + 1 })
      .where(eq(feedPosts.id, postId));
  }

  const row = await db.query.feedPostComments.findFirst({
    where: eq(feedPostComments.id, inserted.id),
    with: { author: true },
  });

  if (!row) {
    throw new FeedError("INTERNAL_ERROR", "Failed to load created comment");
  }

  return {
    id: row.id,
    postId: row.postId,
    text: row.text,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    likedByCreator: row.likedByCreator,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
  };
}

export async function uploadFeedImage(userId: string, file: File) {
  try {
    const imageUrl = await uploadPlatformImage(userId, "feed", file);
    return { imageUrl };
  } catch (error) {
    if (error instanceof StorageError) {
      throw new FeedError(error.code, error.message);
    }
    throw error;
  }
}
