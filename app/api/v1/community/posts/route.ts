import { NextRequest } from "next/server";

import { apiError, apiSuccess, validationError } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import {
  CommunityPostError,
  createCommunityPost,
  getCommunityPosts,
} from "@/lib/services/communityPostService";
import { createCommunityPostSchema } from "@/lib/validators/communityPostValidator";
import type { CommunityPostKind } from "@/types/communityPost";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  const kindParam = request.nextUrl.searchParams.get("kind");
  const kind =
    kindParam === "project" ||
    kindParam === "assistance" ||
    kindParam === "tip"
      ? (kindParam as CommunityPostKind)
      : "all";

  try {
    const posts = await getCommunityPosts(kind);
    return apiSuccess(posts);
  } catch (error) {
    console.error("Community posts fetch error:", error);
    return apiError("INTERNAL_ERROR", "Failed to load community posts", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const body = await request.json();
    const parsed = createCommunityPostSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const post = await createCommunityPost(session.userId, parsed.data);
    return apiSuccess(post, 201);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      const status = error.code === "SERVICE_UNAVAILABLE" ? 503 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Community post create error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create post", 500);
  }
}
