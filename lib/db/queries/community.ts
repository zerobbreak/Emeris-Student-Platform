import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { communityPostComments, communityPostLikes, communityPosts } from "@/lib/db/schema";
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
}, hasLiked: boolean = false): CommunityPost {
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
    commentCount: row.commentCount,
    hasLiked,
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
  if (currentUserId) {
    const likes = await db.query.communityPostLikes.findMany({
      where: (likes, { and, eq, inArray }) =>
        and(
          eq(likes.userId, currentUserId),
          inArray(likes.postId, rows.map((r) => r.id))
        ),
      columns: { postId: true },
    });
    likedPostIds = new Set(likes.map((l) => l.postId));
  }

  return rows.map((row) => mapCommunityPost(row, likedPostIds.has(row.id)));
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
  if (currentUserId) {
    const like = await db.query.communityPostLikes.findFirst({
      where: (likes, { and, eq }) =>
        and(eq(likes.userId, currentUserId), eq(likes.postId, id)),
    });
    hasLiked = !!like;
  }

  return mapCommunityPost(row, hasLiked);
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
}): CommunityPostComment {
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

export async function getCommunityPostComments(
  postId: string,
): Promise<CommunityPostComment[]> {
  const rows = await db.query.communityPostComments.findMany({
    where: (comments, { eq }) => eq(comments.postId, postId),
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    with: { author: true },
  });

  return rows.map(mapCommunityPostComment);
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
