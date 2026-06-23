import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import { removeSkillFromProfile } from "@/lib/services/profileService";

type RouteContext = { params: Promise<{ id: string; skillId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  const { id, skillId } = await context.params;

  if (session.userId !== id) {
    return apiError("FORBIDDEN", "Not profile owner", 403);
  }

  await removeSkillFromProfile(id, skillId);
  return apiSuccess({ success: true });
}
