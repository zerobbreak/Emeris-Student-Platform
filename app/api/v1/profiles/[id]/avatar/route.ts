import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import { ProfileError, uploadAvatar } from "@/lib/services/profileService";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  const { id } = await context.params;

  if (session.userId !== id) {
    return apiError("FORBIDDEN", "Not profile owner", 403);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "File is required", 400);
    }

    const result = await uploadAvatar(id, file);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ProfileError) {
      const status = error.code === "SERVICE_UNAVAILABLE" ? 503 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Avatar upload error:", error);
    return apiError("INTERNAL_ERROR", "Upload failed", 500);
  }
}
