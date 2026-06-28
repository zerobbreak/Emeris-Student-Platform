import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feedPostCommentDislikes, feedPostCommentLikes, feedPostComments, feedPostDislikes, feedPostLikes, feedPosts } from "@/lib/db/schema";
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
  hasDisliked?: boolean;
}, userCommentLikes?: Set<string>, userCommentDislikes?: Set<string>): FeedPost {
  return {
    id: row.id,
    text: row.text,
    imageUrl: row.imageUrl,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    commentCount: row.commentCount,
    createdAt: row.createdAt.toISOString(),
    hasLiked: row.hasLiked ?? false,
    hasDisliked: row.hasDisliked ?? false,
    author: mapAuthor(row.author),
    comments: row.comments.map(
      (comment): FeedComment => ({
        id: comment.id,
        postId: comment.postId,
        text: comment.text,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        likedByCreator: comment.likedByCreator,
        hasLiked: userCommentLikes?.has(comment.id) ?? false,
        hasDisliked: userCommentDislikes?.has(comment.id) ?? false,
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
  let userDislikes = new Set<string>();
  let userCommentLikes = new Set<string>();
  let userCommentDislikes = new Set<string>();
  if (currentUserId) {
    const postIds = rows.map((r) => r.id);
    const likes = await db.query.feedPostLikes.findMany({
      where: (likes, { eq, and, inArray }) =>
        and(eq(likes.userId, currentUserId), inArray(likes.postId, postIds)),
    });
    userLikes = new Set(likes.map((l) => l.postId));

    const dislikes = await db.query.feedPostDislikes.findMany({
      where: (dislikes, { eq, and, inArray }) =>
        and(eq(dislikes.userId, currentUserId), inArray(dislikes.postId, postIds)),
    });
    userDislikes = new Set(dislikes.map((d) => d.postId));

    const commentIds = rows.flatMap((r) => r.comments.map((c) => c.id));
    if (commentIds.length > 0) {
      const cLikes = await db.query.feedPostCommentLikes.findMany({
        where: (likes, { eq, and, inArray }) =>
          and(eq(likes.userId, currentUserId), inArray(likes.commentId, commentIds)),
      });
      userCommentLikes = new Set(cLikes.map((l) => l.commentId));

      const cDislikes = await db.query.feedPostCommentDislikes.findMany({
        where: (dislikes, { eq, and, inArray }) =>
          and(eq(dislikes.userId, currentUserId), inArray(dislikes.commentId, commentIds)),
      });
      userCommentDislikes = new Set(cDislikes.map((d) => d.commentId));
    }
  }

  return rows.map((row) => mapFeedPost({ ...row, hasLiked: userLikes.has(row.id), hasDisliked: userDislikes.has(row.id) }, userCommentLikes, userCommentDislikes));
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
  let hasDisliked = false;
  let userCommentLikes = new Set<string>();
  let userCommentDislikes = new Set<string>();
  if (currentUserId) {
    const like = await db.query.feedPostLikes.findFirst({
      where: (likes, { eq, and }) =>
        and(eq(likes.userId, currentUserId), eq(likes.postId, id)),
    });
    hasLiked = !!like;

    const dislike = await db.query.feedPostDislikes.findFirst({
      where: (dislikes, { eq, and }) =>
        and(eq(dislikes.userId, currentUserId), eq(dislikes.postId, id)),
    });
    hasDisliked = !!dislike;

    const commentIds = row.comments.map((c) => c.id);
    if (commentIds.length > 0) {
      const cLikes = await db.query.feedPostCommentLikes.findMany({
        where: (likes, { eq, and, inArray }) =>
          and(eq(likes.userId, currentUserId), inArray(likes.commentId, commentIds)),
      });
      userCommentLikes = new Set(cLikes.map((l) => l.commentId));

      const cDislikes = await db.query.feedPostCommentDislikes.findMany({
        where: (dislikes, { eq, and, inArray }) =>
          and(eq(dislikes.userId, currentUserId), inArray(dislikes.commentId, commentIds)),
      });
      userCommentDislikes = new Set(cDislikes.map((d) => d.commentId));
    }
  }

  return mapFeedPost({ ...row, hasLiked, hasDisliked }, userCommentLikes, userCommentDislikes);
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

export async function toggleFeedPostCommentLike(
  userId: string,
  commentId: string,
): Promise<{ hasLiked: boolean; likeCount: number; likedByCreator: boolean }> {
  const comment = await db.query.feedPostComments.findFirst({
    where: (comments, { eq }) => eq(comments.id, commentId),
  });

  if (!comment) {
    throw new FeedError("NOT_FOUND", "Comment not found");
  }

  const post = await db.query.feedPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, comment.postId),
  });

  const isCreator = post?.authorId === userId;

  const existingLike = await db.query.feedPostCommentLikes.findFirst({
    where: (likes, { eq, and }) =>
      and(eq(likes.userId, userId), eq(likes.commentId, commentId)),
  });

  let newLikeCount = comment.likeCount;
  let newLikedByCreator = comment.likedByCreator;

  if (existingLike) {
    await db
      .delete(feedPostCommentLikes)
      .where(
        and(eq(feedPostCommentLikes.userId, userId), eq(feedPostCommentLikes.commentId, commentId)),
      );

    newLikeCount = Math.max(0, comment.likeCount - 1);
    if (isCreator) newLikedByCreator = false;

    await db
      .update(feedPostComments)
      .set({ likeCount: newLikeCount, likedByCreator: newLikedByCreator })
      .where(eq(feedPostComments.id, commentId));

    return { hasLiked: false, likeCount: newLikeCount, likedByCreator: newLikedByCreator };
  } else {
    await db.insert(feedPostCommentLikes).values({
      userId,
      commentId,
    });

    newLikeCount = comment.likeCount + 1;
    if (isCreator) newLikedByCreator = true;

    await db
      .update(feedPostComments)
      .set({ likeCount: newLikeCount, likedByCreator: newLikedByCreator })
      .where(eq(feedPostComments.id, commentId));

    return { hasLiked: true, likeCount: newLikeCount, likedByCreator: newLikedByCreator };
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

export async function toggleFeedPostDislike(
  userId: string,
  postId: string,
): Promise<{ hasDisliked: boolean; dislikeCount: number }> {
  const post = await db.query.feedPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, postId),
  });

  if (!post) {
    throw new FeedError("NOT_FOUND", "Post not found");
  }

  const existingDislike = await db.query.feedPostDislikes.findFirst({
    where: (dislikes, { eq, and }) =>
      and(eq(dislikes.userId, userId), eq(dislikes.postId, postId)),
  });

  if (existingDislike) {
    // Undislike
    await db
      .delete(feedPostDislikes)
      .where(
        and(eq(feedPostDislikes.userId, userId), eq(feedPostDislikes.postId, postId)),
      );

    const newDislikeCount = Math.max(0, post.dislikeCount - 1);
    await db
      .update(feedPosts)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(feedPosts.id, postId));

    return { hasDisliked: false, dislikeCount: newDislikeCount };
  } else {
    // Dislike
    await db.insert(feedPostDislikes).values({
      userId,
      postId,
    });

    const newDislikeCount = post.dislikeCount + 1;
    await db
      .update(feedPosts)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(feedPosts.id, postId));

    return { hasDisliked: true, dislikeCount: newDislikeCount };
  }
}

export async function toggleFeedPostCommentDislike(
  userId: string,
  commentId: string,
): Promise<{ hasDisliked: boolean; dislikeCount: number }> {
  const comment = await db.query.feedPostComments.findFirst({
    where: (comments, { eq }) => eq(comments.id, commentId),
  });

  if (!comment) {
    throw new FeedError("NOT_FOUND", "Comment not found");
  }

  const existingDislike = await db.query.feedPostCommentDislikes.findFirst({
    where: (dislikes, { eq, and }) =>
      and(eq(dislikes.userId, userId), eq(dislikes.commentId, commentId)),
  });

  let newDislikeCount = comment.dislikeCount;

  if (existingDislike) {
    await db
      .delete(feedPostCommentDislikes)
      .where(
        and(eq(feedPostCommentDislikes.userId, userId), eq(feedPostCommentDislikes.commentId, commentId)),
      );

    newDislikeCount = Math.max(0, comment.dislikeCount - 1);

    await db
      .update(feedPostComments)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(feedPostComments.id, commentId));

    return { hasDisliked: false, dislikeCount: newDislikeCount };
  } else {
    await db.insert(feedPostCommentDislikes).values({
      userId,
      commentId,
    });

    newDislikeCount = comment.dislikeCount + 1;

    await db
      .update(feedPostComments)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(feedPostComments.id, commentId));

    return { hasDisliked: true, dislikeCount: newDislikeCount };
  }
}
