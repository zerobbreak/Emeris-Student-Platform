"use server";

import {
  CommunityPostError,
  createCommunityPost,
  createCommunityPostComment,
  getCommunityPostById,
  getCommunityPostComments,
  getCommunityPosts,
  uploadCommunityPostImage,
  toggleCommunityPostLike,
  toggleCommunityPostDislike,
  toggleCommunityPostCommentLike,
  toggleCommunityPostCommentDislike,
  getTrendingTopics,
} from "@/lib/db/queries/community";
import { createCommunityPostSchema } from "@/lib/validators/communityPostValidator";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostComment, CommunityPostKind } from "@/types/communityPost";

import { requireSession } from "@/lib/auth/session";
import { ActionError } from "@/lib/errors";

export async function fetchCommunityPostsAction(
  kind: CommunityPostKind | "all" = "all",
): Promise<CommunityPost[]> {
  const session = await requireSession();
  return getCommunityPosts(kind, session.userId);
}

export async function createCommunityPostAction(
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  const session = await requireSession();

  const parsed = createCommunityPostSchema.safeParse(input);
  if (!parsed.success) {
    throw new ActionError("VALIDATION_ERROR", "Validation failed");
  }

  try {
    return await createCommunityPost(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function uploadCommunityPostImageAction(formData: FormData) {
  const session = await requireSession();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new ActionError("VALIDATION_ERROR", "File is required");
  }

  try {
    return await uploadCommunityPostImage(session.userId, file);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function fetchCommunityPostAction(
  id: string,
): Promise<CommunityPost | null> {
  const session = await requireSession();
  return getCommunityPostById(id, session.userId);
}

export async function fetchCommunityPostCommentsAction(
  postId: string,
): Promise<CommunityPostComment[]> {
  const session = await requireSession();
  return getCommunityPostComments(postId, session.userId);
}

export async function addCommunityPostCommentAction(
  postId: string,
  text: string,
  replyToId?: string | null,
  threadId?: string | null,
): Promise<CommunityPostComment> {
  const session = await requireSession();
  
  if (!text || text.trim() === "") {
    throw new ActionError("VALIDATION_ERROR", "Comment text is required");
  }

  try {
    return await createCommunityPostComment(session.userId, postId, text, replyToId, threadId);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function toggleCommunityPostLikeAction(postId: string) {
  const session = await requireSession();
  
  try {
    return await toggleCommunityPostLike(session.userId, postId);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function toggleCommunityPostCommentLikeAction(commentId: string) {
  const session = await requireSession();

  try {
    return await toggleCommunityPostCommentLike(session.userId, commentId);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function toggleCommunityPostDislikeAction(postId: string) {
  const session = await requireSession();
  
  try {
    return await toggleCommunityPostDislike(session.userId, postId);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function toggleCommunityPostCommentDislikeAction(commentId: string) {
  const session = await requireSession();

  try {
    return await toggleCommunityPostCommentDislike(session.userId, commentId);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function fetchTrendingTopicsAction() {
  const session = await requireSession();
  // While trending topics might not strictly need authentication, 
  // keeping it consistent with the rest of the protected actions.
  return getTrendingTopics();
}
