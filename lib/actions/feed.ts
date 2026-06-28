"use server";

  FeedError,
  createFeedPost,
  createFeedPostComment,
  getFeedPostById,
  getFeedPosts,
  uploadFeedImage,
} from "@/lib/db/queries/feed";
import { createFeedPostSchema } from "@/lib/validators/feedValidator";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedComment, FeedPost } from "@/types/feed";

import { requireSession } from "@/lib/auth/session";
import { ActionError } from "@/lib/errors";

export async function fetchFeedAction(): Promise<FeedPost[]> {
  await requireSession();
  return getFeedPosts();
}

export async function createFeedPostAction(
  input: CreateFeedPostInput,
): Promise<FeedPost> {
  const session = await requireSession();

  const parsed = createFeedPostSchema.safeParse(input);
  if (!parsed.success) {
    throw new ActionError("VALIDATION_ERROR", "Validation failed");
  }

  try {
    return await createFeedPost(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof FeedError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function uploadFeedImageAction(formData: FormData) {
  const session = await requireSession();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new ActionError("VALIDATION_ERROR", "File is required");
  }

  try {
    return await uploadFeedImage(session.userId, file);
  } catch (error) {
    if (error instanceof FeedError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function fetchFeedPostAction(
  id: string,
): Promise<FeedPost | null> {
  await requireSession();
  return getFeedPostById(id);
}

export async function addFeedPostCommentAction(
  postId: string,
  text: string,
): Promise<FeedComment> {
  const session = await requireSession();
  
  if (!text || text.trim() === "") {
    throw new ActionError("VALIDATION_ERROR", "Comment text is required");
  }

  try {
    return await createFeedPostComment(session.userId, postId, text);
  } catch (error) {
    if (error instanceof FeedError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}
