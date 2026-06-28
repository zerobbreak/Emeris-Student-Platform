"use server";

  CommunityPostError,
  createCommunityPost,
  createCommunityPostComment,
  getCommunityPostById,
  getCommunityPostComments,
  getCommunityPosts,
  uploadCommunityPostImage,
} from "@/lib/db/queries/community";
import { createCommunityPostSchema } from "@/lib/validators/communityPostValidator";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostComment, CommunityPostKind } from "@/types/communityPost";

import { requireSession } from "@/lib/auth/session";
import { ActionError } from "@/lib/errors";

export async function fetchCommunityPostsAction(
  kind: CommunityPostKind | "all" = "all",
): Promise<CommunityPost[]> {
  await requireSession();
  return getCommunityPosts(kind);
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
  await requireSession();
  return getCommunityPostById(id);
}

export async function fetchCommunityPostCommentsAction(
  postId: string,
): Promise<CommunityPostComment[]> {
  await requireSession();
  return getCommunityPostComments(postId);
}

export async function addCommunityPostCommentAction(
  postId: string,
  text: string,
): Promise<CommunityPostComment> {
  const session = await requireSession();
  
  if (!text || text.trim() === "") {
    throw new ActionError("VALIDATION_ERROR", "Comment text is required");
  }

  try {
    return await createCommunityPostComment(session.userId, postId, text);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}
