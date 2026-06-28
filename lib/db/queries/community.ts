import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { communityPostComments, communityPosts } from "@/lib/db/schema";
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
}): CommunityPost {
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
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
  };
}

export async function getCommunityPosts(
  kind?: CommunityPostKind | "all",
): Promise<CommunityPost[]> {
  const rows = await db.query.communityPosts.findMany({
    where: (posts, { eq }) =>
      kind && kind !== "all" ? eq(posts.kind, kind) : undefined,
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: { author: true },
  });

  return rows.map(mapCommunityPost);
}

export async function getCommunityPostById(
  id: string,
): Promise<CommunityPost | null> {
  const row = await db.query.communityPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: { author: true },
  });

  if (!row) {
    return null;
  }

  return mapCommunityPost(row);
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
