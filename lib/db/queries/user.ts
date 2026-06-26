import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { UserRole } from "@/types/auth";

const AUTH_MANAGED_PASSWORD = "supabase-auth-managed";

interface AuthProviderUser {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
}

export async function ensureAppUser(
  authUser: AuthProviderUser,
  role?: UserRole,
) {
  const email = authUser.email.toLowerCase();

  const existingById = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });
  if (existingById) return existingById;

  const existingByEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingByEmail) {
    if (existingByEmail.id !== authUser.id) {
      const [updated] = await db
        .update(users)
        .set({
          id: authUser.id,
          name: authUser.name,
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
      id: authUser.id,
      email,
      name: authUser.name,
      passwordHash: AUTH_MANAGED_PASSWORD,
      role: role ?? authUser.role ?? "student",
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
