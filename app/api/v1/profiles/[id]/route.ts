import { NextRequest } from "next/server";

import { apiError, apiSuccess, validationError } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import {
  getPublicProfile,
  ProfileError,
  updateProfile,
} from "@/lib/services/profileService";
import { updateProfileSchema } from "@/lib/validators/profileValidator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const includeParam = request.nextUrl.searchParams.get("include") ?? "skills,stats";
  const includes = includeParam.split(",").map((s) => s.trim());

  const profile = await getPublicProfile(id, {
    includeSkills: includes.includes("skills"),
    includeStats: includes.includes("stats"),
  });

  if (!profile) {
    return apiError("NOT_FOUND", "Profile not found", 404);
  }

  return apiSuccess(profile);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  const { id } = await context.params;

  if (session.userId !== id && session.role !== "admin") {
    return apiError("FORBIDDEN", "Not profile owner", 403);
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const profile = await updateProfile(id, parsed.data);
    if (!profile) {
      return apiError("NOT_FOUND", "Profile not found", 404);
    }

    return apiSuccess(profile);
  } catch (error) {
    if (error instanceof ProfileError) {
      return apiError(error.code, error.message, 400);
    }
    console.error("Update profile error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
