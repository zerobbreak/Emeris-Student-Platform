import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { UserRole } from "@/types/auth";

const NEON_MANAGED_PASSWORD = "neon-auth-managed";

interface NeonUser {
  id: string;
  email: string;
  name: string;
}

export async function ensureAppUser(
  neonUser: NeonUser,
  role?: UserRole,
) {
  const email = neonUser.email.toLowerCase();

  const existingById = await db.query.users.findFirst({
    where: eq(users.id, neonUser.id),
  });
  if (existingById) return existingById;

  const existingByEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingByEmail) {
    if (existingByEmail.id !== neonUser.id) {
      const [updated] = await db
        .update(users)
        .set({
          id: neonUser.id,
          name: neonUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .returning();
      return updated;
    }
    return existingByEmail;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: neonUser.id,
      email,
      name: neonUser.name,
      passwordHash: NEON_MANAGED_PASSWORD,
      role: role ?? "student",
    })
    .returning();

  return created;
}

export function toAuthUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOnboarded: user.isOnboarded,
  };
}
