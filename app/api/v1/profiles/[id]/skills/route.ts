import { NextRequest } from "next/server";

import { apiError, apiSuccess, validationError } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import {
  addSkillToProfile,
  getProfileSkills,
  ProfileError,
} from "@/lib/services/profileService";
import { addSkillSchema } from "@/lib/validators/profileValidator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const skills = await getProfileSkills(id);
  return apiSuccess(skills);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  const { id } = await context.params;

  if (session.userId !== id) {
    return apiError("FORBIDDEN", "Not profile owner", 403);
  }

  try {
    const body = await request.json();
    const parsed = addSkillSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const skill = await addSkillToProfile(id, parsed.data);
    return apiSuccess(skill, 201);
  } catch (error) {
    if (error instanceof ProfileError) {
      const status = error.code === "CONFLICT" ? 409 : 400;
      return apiError(error.code, error.message, status);
    }
    console.error("Add skill error:", error);
    return apiError("INTERNAL_ERROR", "Failed to add skill", 500);
  }
}
