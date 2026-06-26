import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { skills, userSkills, users } from "@/lib/db/schema";
import {
  StorageError,
  uploadPlatformImage,
} from "@/lib/supabase/storage";
import type { AddSkillInput, UpdateProfileInput } from "@/lib/validators/profileValidator";
import type { ProfileStats, PublicProfile } from "@/types/profile";

function stubStats(): ProfileStats {
  return {
    projectCount: 0,
    certCount: 0,
    totalPoints: 0,
    currentLevel: "Beginner",
  };
}

function mapProfile(
  user: typeof users.$inferSelect,
  includeSkills = false,
  includeStats = false,
): PublicProfile {
  const profile: PublicProfile = {
    id: user.id,
    name: user.name,
    bio: user.bio,
    profileImage: user.profileImage,
    course: user.course,
    year: user.year,
    location: user.location,
    role: user.role,
    githubUrl: user.githubUrl,
    linkedinUrl: user.linkedinUrl,
    createdAt: user.createdAt.toISOString(),
    isOnboarded: user.isOnboarded,
  };

  if (includeStats) {
    profile.stats = stubStats();
  }

  if (includeSkills) {
    profile.skills = [];
  }

  return profile;
}

export async function getPublicProfile(
  userId: string,
  options: { includeSkills?: boolean; includeStats?: boolean } = {},
): Promise<PublicProfile | null> {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.isActive, true)),
    with:
      options.includeSkills
        ? {
            userSkills: {
              with: { skill: true },
            },
          }
        : undefined,
  });

  if (!user) return null;

  const profile = mapProfile(
    user,
    options.includeSkills,
    options.includeStats,
  );

  if (options.includeSkills && "userSkills" in user && Array.isArray(user.userSkills)) {
    profile.skills = user.userSkills.map((us: {
      skill: { id: string; name: string; category: string };
      endorsementCount: number;
      addedAt: Date;
    }) => ({
      id: us.skill.id,
      name: us.skill.name,
      category: us.skill.category,
      endorsementCount: us.endorsementCount,
      addedAt: us.addedAt.toISOString(),
    }));
  }

  if (options.includeStats) {
    profile.stats = stubStats();
  }

  return profile;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicProfile | null> {
  const updates: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updates.name = input.name;
  if (input.bio !== undefined) updates.bio = input.bio || null;
  if (input.course !== undefined) updates.course = input.course || null;
  if (input.year !== undefined) updates.year = input.year;
  if (input.location !== undefined) updates.location = input.location || null;
  if (input.githubUrl !== undefined) {
    updates.githubUrl = input.githubUrl || null;
  }
  if (input.linkedinUrl !== undefined) {
    updates.linkedinUrl = input.linkedinUrl || null;
  }
  if (input.isOnboarded !== undefined) updates.isOnboarded = input.isOnboarded;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  if (!updated) return null;

  return getPublicProfile(userId, { includeSkills: true, includeStats: true });
}

export async function getProfileSkills(userId: string) {
  const rows = await db.query.userSkills.findMany({
    where: eq(userSkills.userId, userId),
    with: { skill: true },
  });

  return rows.map((us) => ({
    id: us.skill.id,
    name: us.skill.name,
    category: us.skill.category,
    endorsementCount: us.endorsementCount,
    addedAt: us.addedAt.toISOString(),
  }));
}

export async function addSkillToProfile(userId: string, input: AddSkillInput) {
  let skillId = input.skillId;

  if (!skillId && input.skillName) {
    const existing = await db.query.skills.findFirst({
      where: eq(skills.name, input.skillName),
    });

    if (existing) {
      skillId = existing.id;
    } else {
      const [created] = await db
        .insert(skills)
        .values({
          name: input.skillName,
          category: "soft",
        })
        .returning();
      skillId = created.id;
    }
  }

  if (!skillId) {
    throw new ProfileError("VALIDATION_ERROR", "Skill not found");
  }

  const duplicate = await db.query.userSkills.findFirst({
    where: and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)),
  });

  if (duplicate) {
    throw new ProfileError("CONFLICT", "Skill already on profile");
  }

  await db.insert(userSkills).values({
    id: createId(),
    userId,
    skillId,
  });

  const skill = await db.query.skills.findFirst({
    where: eq(skills.id, skillId),
  });

  if (!skill) {
    throw new ProfileError("NOT_FOUND", "Skill not found");
  }

  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    endorsementCount: 0,
  };
}

export async function removeSkillFromProfile(
  userId: string,
  skillId: string,
) {
  await db
    .delete(userSkills)
    .where(
      and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)),
    );
}

function mapStorageError(error: unknown): never {
  if (error instanceof StorageError) {
    throw new ProfileError(error.code, error.message);
  }
  throw error;
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const profileImage = await uploadPlatformImage(userId, "avatars", file);

    await db
      .update(users)
      .set({ profileImage, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { profileImage };
  } catch (error) {
    mapStorageError(error);
  }
}

export class ProfileError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProfileError";
  }
}
