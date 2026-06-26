import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import {
  CommunityPostError,
  uploadCommunityPostImage,
} from "@/lib/services/communityPostService";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "File is required", 400);
    }

    const result = await uploadCommunityPostImage(session.userId, file);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof CommunityPostError) {
      const status = error.code === "SERVICE_UNAVAILABLE" ? 503 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Community post image upload error:", error);
    return apiError("INTERNAL_ERROR", "Upload failed", 500);
  }
}
