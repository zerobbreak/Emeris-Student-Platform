"use server";

import {
  ProfileError,
  addSkillToProfile,
  getPublicProfile,
  removeSkillFromProfile,
  updateProfile,
  uploadAvatar,
} from "@/lib/db/queries/profile";
import {
  addSkillSchema,
  updateProfileSchema,
} from "@/lib/validators/profileValidator";
import type { ProfileUpdateInput, PublicProfile } from "@/types/profile";

import { ActionError } from "@/lib/errors";
import { requireSession } from "@/lib/auth/session";

export async function fetchProfileAction(
  userId: string,
): Promise<PublicProfile> {
  const profile = await getPublicProfile(userId, {
    includeSkills: true,
    includeStats: true,
  });

  if (!profile) {
    throw new ActionError("NOT_FOUND", "Profile not found");
  }

  return profile;
}

export async function updateProfileAction(
  userId: string,
  data: ProfileUpdateInput,
): Promise<PublicProfile> {
  const session = await requireSession();

  if (session.userId !== userId && session.role !== "admin") {
    throw new ActionError("FORBIDDEN", "Not profile owner");
  }

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw new ActionError("VALIDATION_ERROR", "Validation failed");
  }

  try {
    const profile = await updateProfile(userId, parsed.data);
    if (!profile) {
      throw new ActionError("NOT_FOUND", "Profile not found");
    }
    return profile;
  } catch (error) {
    if (error instanceof ProfileError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function addSkillAction(
  userId: string,
  data: { skillId?: string; skillName?: string },
) {
  const session = await requireSession();

  if (session.userId !== userId) {
    throw new ActionError("FORBIDDEN", "Not profile owner");
  }

  const parsed = addSkillSchema.safeParse(data);
  if (!parsed.success) {
    throw new ActionError("VALIDATION_ERROR", "Validation failed");
  }

  try {
    return await addSkillToProfile(userId, parsed.data);
  } catch (error) {
    if (error instanceof ProfileError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}

export async function removeSkillAction(userId: string, skillId: string) {
  const session = await requireSession();

  if (session.userId !== userId) {
    throw new ActionError("FORBIDDEN", "Not profile owner");
  }

  await removeSkillFromProfile(userId, skillId);
}

export async function uploadAvatarAction(userId: string, formData: FormData) {
  const session = await requireSession();

  if (session.userId !== userId) {
    throw new ActionError("FORBIDDEN", "Not profile owner");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new ActionError("VALIDATION_ERROR", "File is required");
  }

  try {
    return await uploadAvatar(userId, file);
  } catch (error) {
    if (error instanceof ProfileError) {
      throw new ActionError(error.code, error.message);
    }
    throw error;
  }
}
