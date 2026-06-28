import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { communityPostCommentDislikes, communityPostCommentLikes, communityPostComments, communityPostDislikes, communityPostLikes, communityPosts } from "@/lib/db/schema";
import {
  StorageError,
  uploadPlatformImage,
} from "@/lib/supabase/storage";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostComment, CommunityPostKind } from "@/types/communityPost";


export class CommunityPostError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CommunityPostError";
  }
}

function mapAuthor(user: {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
}) {
  return {
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
    course: user.course,
    year: user.year,
  };
}

function mapCommunityPost(row: {
  id: string;
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  tags: string[];
  imageUrl: string | null;
  projectId: string | null;
  projectTitle: string | null;
  projectStatus: CommunityPost["projectStatus"];
  technologies: string[] | null;
  assistanceArea: string | null;
  tipFocus: string | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  featured: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    profileImage: string | null;
    course: string | null;
    year: number | null;
  };
}, hasLiked: boolean = false, hasDisliked: boolean = false): CommunityPost {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    excerpt: row.excerpt,
    tags: row.tags,
    imageUrl: row.imageUrl,
    projectId: row.projectId,
    projectTitle: row.projectTitle,
    projectStatus: row.projectStatus,
    technologies: row.technologies,
    assistanceArea: row.assistanceArea,
    tipFocus: row.tipFocus,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    commentCount: row.commentCount,
    hasLiked,
    hasDisliked,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
  };
}

export async function getCommunityPosts(
  kind?: CommunityPostKind | "all",
  currentUserId?: string,
): Promise<CommunityPost[]> {
  const rows = await db.query.communityPosts.findMany({
    where: (posts, { eq }) =>
      kind && kind !== "all" ? eq(posts.kind, kind) : undefined,
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: { author: true },
  });

  if (!rows.length) return [];

  let likedPostIds = new Set<string>();
  let dislikedPostIds = new Set<string>();
  if (currentUserId) {
    const postIds = rows.map((r) => r.id);
    const likes = await db.query.communityPostLikes.findMany({
      where: (likes, { and, eq, inArray }) =>
        and(
          eq(likes.userId, currentUserId),
          inArray(likes.postId, postIds)
        ),
      columns: { postId: true },
    });
    likedPostIds = new Set(likes.map((l) => l.postId));

    const dislikes = await db.query.communityPostDislikes.findMany({
      where: (dislikes, { and, eq, inArray }) =>
        and(
          eq(dislikes.userId, currentUserId),
          inArray(dislikes.postId, postIds)
        ),
      columns: { postId: true },
    });
    dislikedPostIds = new Set(dislikes.map((d) => d.postId));
  }

  return rows.map((row) => mapCommunityPost(row, likedPostIds.has(row.id), dislikedPostIds.has(row.id)));
}

export async function getCommunityPostById(
  id: string,
  currentUserId?: string,
): Promise<CommunityPost | null> {
  const row = await db.query.communityPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: { author: true },
  });

  if (!row) {
    return null;
  }

  let hasLiked = false;
  let hasDisliked = false;
  if (currentUserId) {
    const like = await db.query.communityPostLikes.findFirst({
      where: (likes, { and, eq }) =>
        and(eq(likes.userId, currentUserId), eq(likes.postId, id)),
    });
    hasLiked = !!like;

    const dislike = await db.query.communityPostDislikes.findFirst({
      where: (dislikes, { and, eq }) =>
        and(eq(dislikes.userId, currentUserId), eq(dislikes.postId, id)),
    });
    hasDisliked = !!dislike;
  }

  return mapCommunityPost(row, hasLiked, hasDisliked);
}

function mapCommunityPostComment(row: {
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
}, hasLiked: boolean = false, hasDisliked: boolean = false): CommunityPostComment {
  return {
    id: row.id,
    postId: row.postId,
    text: row.text,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    likedByCreator: row.likedByCreator,
    hasLiked,
    hasDisliked,
    replyToId: row.replyToId,
    threadId: row.threadId,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
  };
}

export async function getCommunityPostComments(
  postId: string,
  currentUserId?: string,
): Promise<CommunityPostComment[]> {
  const rows = await db.query.communityPostComments.findMany({
    where: (comments, { eq }) => eq(comments.postId, postId),
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    with: { author: true },
  });

  if (!rows.length) return [];

  let userCommentLikes = new Set<string>();
  let userCommentDislikes = new Set<string>();
  if (currentUserId) {
    const commentIds = rows.map((c) => c.id);
    const cLikes = await db.query.communityPostCommentLikes.findMany({
      where: (likes, { eq, and, inArray }) =>
        and(eq(likes.userId, currentUserId), inArray(likes.commentId, commentIds)),
    });
    userCommentLikes = new Set(cLikes.map((l) => l.commentId));

    const cDislikes = await db.query.communityPostCommentDislikes.findMany({
      where: (dislikes, { eq, and, inArray }) =>
        and(eq(dislikes.userId, currentUserId), inArray(dislikes.commentId, commentIds)),
    });
    userCommentDislikes = new Set(cDislikes.map((d) => d.commentId));
  }

  return rows.map((row) => mapCommunityPostComment(row, userCommentLikes.has(row.id), userCommentDislikes.has(row.id)));
}

export async function createCommunityPost(
  authorId: string,
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  const imageUrl = input.imageUrl?.trim() || null;
  const projectId = input.projectId?.trim() || null;
  const sharedProjectTitle =
    input.kind === "project"
      ? input.projectTitle.trim()
      : input.projectTitle?.trim() || null;

  const [inserted] = await db
    .insert(communityPosts)
    .values({
      authorId,
      kind: input.kind,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      tags: input.tags,
      imageUrl,
      projectId,
      projectTitle: sharedProjectTitle,
      projectStatus: input.kind === "project" ? input.projectStatus : null,
      technologies: input.kind === "project" ? input.technologies : null,
      assistanceArea: input.kind === "assistance" ? input.assistanceArea : null,
      tipFocus: input.kind === "tip" ? input.tipFocus : null,
    })
    .returning({ id: communityPosts.id });

  const row = await db.query.communityPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, inserted.id),
    with: { author: true },
  });

  if (!row) {
    throw new CommunityPostError("INTERNAL_ERROR", "Failed to load created post");
  }

  return mapCommunityPost(row);
}

export async function createCommunityPostComment(
  authorId: string,
  postId: string,
  text: string,
  replyToId?: string | null,
  threadId?: string | null,
): Promise<CommunityPostComment> {
  const [inserted] = await db
    .insert(communityPostComments)
    .values({
      authorId,
      postId,
      text: text.trim(),
      replyToId: replyToId || null,
      threadId: threadId || null,
    })
    .returning({ id: communityPostComments.id });

  // Increment commentCount on the post
  const post = await getCommunityPostById(postId);
  if (post) {
    await db
      .update(communityPosts)
      .set({ commentCount: post.commentCount + 1 })
      .where(eq(communityPosts.id, postId));
  }

  const row = await db.query.communityPostComments.findFirst({
    where: (comments, { eq }) => eq(comments.id, inserted.id),
    with: { author: true },
  });

  if (!row) {
    throw new CommunityPostError("INTERNAL_ERROR", "Failed to load created comment");
  }

  return mapCommunityPostComment(row);
}

export async function uploadCommunityPostImage(userId: string, file: File) {
  try {
    const imageUrl = await uploadPlatformImage(userId, "community", file);
    return { imageUrl };
  } catch (error) {
    if (error instanceof StorageError) {
      throw new CommunityPostError(error.code, error.message);
    }
    throw error;
  }
}

export async function toggleCommunityPostLike(userId: string, postId: string) {
  const existingLike = await db.query.communityPostLikes.findFirst({
    where: (likes, { and, eq }) =>
      and(eq(likes.userId, userId), eq(likes.postId, postId)),
  });

  const post = await getCommunityPostById(postId);
  if (!post) {
    throw new CommunityPostError("NOT_FOUND", "Post not found");
  }

  if (existingLike) {
    await db
      .delete(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.userId, userId),
          eq(communityPostLikes.postId, postId),
        ),
      );
    
    const newCount = Math.max(0, post.likeCount - 1);
    await db
      .update(communityPosts)
      .set({ likeCount: newCount })
      .where(eq(communityPosts.id, postId));

    return { hasLiked: false, likeCount: newCount };
  } else {
    await db.insert(communityPostLikes).values({
      userId,
      postId,
    });

    const newCount = post.likeCount + 1;
    await db
      .update(communityPosts)
      .set({ likeCount: newCount })
      .where(eq(communityPosts.id, postId));

    return { hasLiked: true, likeCount: newCount };
  }
}

export async function toggleCommunityPostCommentLike(
  userId: string,
  commentId: string,
): Promise<{ hasLiked: boolean; likeCount: number; likedByCreator: boolean }> {
  const comment = await db.query.communityPostComments.findFirst({
    where: (comments, { eq }) => eq(comments.id, commentId),
  });

  if (!comment) {
    throw new CommunityPostError("NOT_FOUND", "Comment not found");
  }

  const post = await db.query.communityPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, comment.postId),
  });

  const isCreator = post?.authorId === userId;

  const existingLike = await db.query.communityPostCommentLikes.findFirst({
    where: (likes, { eq, and }) =>
      and(eq(likes.userId, userId), eq(likes.commentId, commentId)),
  });

  let newLikeCount = comment.likeCount;
  let newLikedByCreator = comment.likedByCreator;

  if (existingLike) {
    await db
      .delete(communityPostCommentLikes)
      .where(
        and(eq(communityPostCommentLikes.userId, userId), eq(communityPostCommentLikes.commentId, commentId)),
      );

    newLikeCount = Math.max(0, comment.likeCount - 1);
    if (isCreator) newLikedByCreator = false;

    await db
      .update(communityPostComments)
      .set({ likeCount: newLikeCount, likedByCreator: newLikedByCreator })
      .where(eq(communityPostComments.id, commentId));

    return { hasLiked: false, likeCount: newLikeCount, likedByCreator: newLikedByCreator };
  } else {
    await db.insert(communityPostCommentLikes).values({
      userId,
      commentId,
    });

    newLikeCount = comment.likeCount + 1;
    if (isCreator) newLikedByCreator = true;

    await db
      .update(communityPostComments)
      .set({ likeCount: newLikeCount, likedByCreator: newLikedByCreator })
      .where(eq(communityPostComments.id, commentId));

    return { hasLiked: true, likeCount: newLikeCount, likedByCreator: newLikedByCreator };
  }
}

export async function toggleCommunityPostDislike(userId: string, postId: string) {
  const existingDislike = await db.query.communityPostDislikes.findFirst({
    where: (dislikes, { and, eq }) =>
      and(eq(dislikes.userId, userId), eq(dislikes.postId, postId)),
  });

  const post = await getCommunityPostById(postId);
  if (!post) {
    throw new CommunityPostError("NOT_FOUND", "Post not found");
  }

  if (existingDislike) {
    await db
      .delete(communityPostDislikes)
      .where(
        and(
          eq(communityPostDislikes.userId, userId),
          eq(communityPostDislikes.postId, postId),
        ),
      );
    
    const newCount = Math.max(0, (post.dislikeCount || 0) - 1);
    await db
      .update(communityPosts)
      .set({ dislikeCount: newCount })
      .where(eq(communityPosts.id, postId));

    return { hasDisliked: false, dislikeCount: newCount };
  } else {
    await db.insert(communityPostDislikes).values({
      userId,
      postId,
    });

    const newCount = (post.dislikeCount || 0) + 1;
    await db
      .update(communityPosts)
      .set({ dislikeCount: newCount })
      .where(eq(communityPosts.id, postId));

    return { hasDisliked: true, dislikeCount: newCount };
  }
}

export async function toggleCommunityPostCommentDislike(
  userId: string,
  commentId: string,
): Promise<{ hasDisliked: boolean; dislikeCount: number }> {
  const comment = await db.query.communityPostComments.findFirst({
    where: (comments, { eq }) => eq(comments.id, commentId),
  });

  if (!comment) {
    throw new CommunityPostError("NOT_FOUND", "Comment not found");
  }

  const existingDislike = await db.query.communityPostCommentDislikes.findFirst({
    where: (dislikes, { eq, and }) =>
      and(eq(dislikes.userId, userId), eq(dislikes.commentId, commentId)),
  });

  let newDislikeCount = comment.dislikeCount;

  if (existingDislike) {
    await db
      .delete(communityPostCommentDislikes)
      .where(
        and(eq(communityPostCommentDislikes.userId, userId), eq(communityPostCommentDislikes.commentId, commentId)),
      );

    newDislikeCount = Math.max(0, comment.dislikeCount - 1);

    await db
      .update(communityPostComments)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(communityPostComments.id, commentId));

    return { hasDisliked: false, dislikeCount: newDislikeCount };
  } else {
    await db.insert(communityPostCommentDislikes).values({
      userId,
      commentId,
    });

    newDislikeCount = comment.dislikeCount + 1;

    await db
      .update(communityPostComments)
      .set({ dislikeCount: newDislikeCount })
      .where(eq(communityPostComments.id, commentId));

    return { hasDisliked: true, dislikeCount: newDislikeCount };
  }
}
