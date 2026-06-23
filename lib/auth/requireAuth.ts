import { apiError } from "@/lib/api/response";
import { auth } from "@/lib/auth/server";
import { ensureAppUser } from "@/lib/services/userSync";
import type { UserRole } from "@/types/auth";

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
}

export async function requireAuth(): Promise<Session | Response> {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const appUser = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  return {
    userId: appUser.id,
    email: appUser.email,
    role: appUser.role,
  };
}

export function requireRole(
  session: Session,
  allowedRoles: UserRole[],
): Response | null {
  if (!allowedRoles.includes(session.role)) {
    return apiError("FORBIDDEN", "Insufficient permissions", 403);
  }
  return null;
}

export function isSession(value: Session | Response): value is Session {
  return !(value instanceof Response);
}
