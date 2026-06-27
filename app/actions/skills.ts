"use server";

import { requireSession } from "@/lib/auth/session";
import { db, skills, userSkills } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllSkills() {
  const session = await requireSession();
  
  const allSkills = await db.query.skills.findMany({
    orderBy: (skills, { asc }) => [asc(skills.name)],
  });

  return allSkills;
}

export async function getUserSkillsBoard() {
  const session = await requireSession();

  const boardSkills = await db.query.userSkills.findMany({
    where: eq(userSkills.userId, session.userId),
    with: {
      skill: true,
    },
    orderBy: (userSkills, { desc }) => [desc(userSkills.addedAt)],
  });

  return boardSkills;
}

export async function addUserSkill(skillId: string) {
  const session = await requireSession();

  // check if it already exists
  const existing = await db.query.userSkills.findFirst({
    where: and(
      eq(userSkills.userId, session.userId),
      eq(userSkills.skillId, skillId)
    ),
  });

  if (existing) {
    throw new Error("Skill already added to your board.");
  }

  await db.insert(userSkills).values({
    userId: session.userId,
    skillId,
    status: "to_learn",
  });

  revalidatePath("/skills");
}

export async function updateUserSkillStatus(skillId: string, status: "to_learn" | "learning" | "mastered") {
  const session = await requireSession();

  await db
    .update(userSkills)
    .set({ status })
    .where(
      and(
        eq(userSkills.userId, session.userId),
        eq(userSkills.skillId, skillId)
      )
    );

  revalidatePath("/skills");
}

export async function removeUserSkill(skillId: string) {
  const session = await requireSession();

  await db
    .delete(userSkills)
    .where(
      and(
        eq(userSkills.userId, session.userId),
        eq(userSkills.skillId, skillId)
      )
    );

  revalidatePath("/skills");
}
