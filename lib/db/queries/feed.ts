import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feedPostComments, feedPostLikes, feedPosts } from "@/lib/db/schema";
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
    replyToId: string | null;
    threadId: string | null;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      profileImage: string | null;
      course: string | null;
      year: number | null;
    };
  }>;
  hasLiked?: boolean;
}): FeedPost {
  return {
    id: row.id,
    text: row.text,
    imageUrl: row.imageUrl,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    commentCount: row.commentCount,
    createdAt: row.createdAt.toISOString(),
    hasLiked: row.hasLiked ?? false,
    author: mapAuthor(row.author),
    comments: row.comments.map(
      (comment): FeedComment => ({
        id: comment.id,
        postId: comment.postId,
        text: comment.text,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        likedByCreator: comment.likedByCreator,
        replyToId: comment.replyToId,
        threadId: comment.threadId,
        createdAt: comment.createdAt.toISOString(),
        author: mapAuthor(comment.author),
      }),
    ),
  };
}

export async function getFeedPosts(currentUserId?: string): Promise<FeedPost[]> {
  const rows = await db.query.feedPosts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!rows.length) return [];

  let userLikes = new Set<string>();
  if (currentUserId) {
    const postIds = rows.map((r) => r.id);
    const likes = await db.query.feedPostLikes.findMany({
      where: (likes, { eq, and, inArray }) =>
        and(eq(likes.userId, currentUserId), inArray(likes.postId, postIds)),
    });
    userLikes = new Set(likes.map((l) => l.postId));
  }

  return rows.map((row) => mapFeedPost({ ...row, hasLiked: userLikes.has(row.id) }));
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
    where: (posts, { eq }) => eq(posts.id, inserted.id),
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

export async function getFeedPostById(id: string, currentUserId?: string): Promise<FeedPost | null> {
  const row = await db.query.feedPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
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

  let hasLiked = false;
  if (currentUserId) {
    const like = await db.query.feedPostLikes.findFirst({
      where: (likes, { eq, and }) =>
        and(eq(likes.userId, currentUserId), eq(likes.postId, id)),
    });
    hasLiked = !!like;
  }

  return mapFeedPost({ ...row, hasLiked });
}

export async function toggleFeedPostLike(
  userId: string,
  postId: string,
): Promise<{ hasLiked: boolean; likeCount: number }> {
  // Check if post exists
  const post = await db.query.feedPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, postId),
  });

  if (!post) {
    throw new FeedError("NOT_FOUND", "Post not found");
  }

  // Check if like exists
  const existingLike = await db.query.feedPostLikes.findFirst({
    where: (likes, { eq, and }) =>
      and(eq(likes.userId, userId), eq(likes.postId, postId)),
  });

  if (existingLike) {
    // Unlike
    await db
      .delete(feedPostLikes)
      .where(
        and(eq(feedPostLikes.userId, userId), eq(feedPostLikes.postId, postId)),
      );

    const newLikeCount = Math.max(0, post.likeCount - 1);
    await db
      .update(feedPosts)
      .set({ likeCount: newLikeCount })
      .where(eq(feedPosts.id, postId));

    return { hasLiked: false, likeCount: newLikeCount };
  } else {
    // Like
    await db.insert(feedPostLikes).values({
      userId,
      postId,
    });

    const newLikeCount = post.likeCount + 1;
    await db
      .update(feedPosts)
      .set({ likeCount: newLikeCount })
      .where(eq(feedPosts.id, postId));

    return { hasLiked: true, likeCount: newLikeCount };
  }
}

export async function createFeedPostComment(
  authorId: string,
  postId: string,
  text: string,
  replyToId?: string | null,
  threadId?: string | null,
): Promise<FeedComment> {
  const [inserted] = await db
    .insert(feedPostComments)
    .values({
      authorId,
      postId,
      text: text.trim(),
      replyToId: replyToId || null,
      threadId: threadId || null,
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
    where: (comments, { eq }) => eq(comments.id, inserted.id),
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
    replyToId: row.replyToId,
    threadId: row.threadId,
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
