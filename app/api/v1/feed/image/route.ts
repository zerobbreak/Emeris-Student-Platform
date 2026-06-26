import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import { FeedError, uploadFeedImage } from "@/lib/services/feedService";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "File is required", 400);
    }

    const result = await uploadFeedImage(session.userId, file);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof FeedError) {
      const status = error.code === "SERVICE_UNAVAILABLE" ? 503 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Feed image upload error:", error);
    return apiError("INTERNAL_ERROR", "Upload failed", 500);
  }
}
