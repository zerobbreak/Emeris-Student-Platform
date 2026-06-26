import { NextRequest } from "next/server";

import { apiError, apiSuccess, validationError } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import {
  createFeedPost,
  FeedError,
  getFeedPosts,
} from "@/lib/services/feedService";
import { createFeedPostSchema } from "@/lib/validators/feedValidator";

export async function GET() {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const posts = await getFeedPosts();
    return apiSuccess(posts);
  } catch (error) {
    console.error("Feed fetch error:", error);
    return apiError("INTERNAL_ERROR", "Failed to load feed", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const body = await request.json();
    const parsed = createFeedPostSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const post = await createFeedPost(session.userId, parsed.data);
    return apiSuccess(post, 201);
  } catch (error) {
    if (error instanceof FeedError) {
      const status = error.code === "SERVICE_UNAVAILABLE" ? 503 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Feed create error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create post", 500);
  }
}
