import { getAuthProviderUser } from "@/lib/auth/supabase-user";
import { ensureAppUser } from "@/lib/db/queries/user";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

import { ActionError } from "@/lib/errors";

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const providerUser = getAuthProviderUser(user);
  const appUser = await ensureAppUser(providerUser, providerUser.role);

  return {
    userId: appUser.id,
    email: appUser.email,
    role: appUser.role,
  };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new ActionError("UNAUTHORIZED", "Authentication required");
  }
  return session;
}

export function requireRole(session: Session, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new ActionError("FORBIDDEN", "Insufficient permissions");
  }
}
