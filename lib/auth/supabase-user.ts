import type { User } from "@supabase/supabase-js";

import type { UserRole } from "@/types/auth";

export interface AuthProviderUser {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
}

export function getAuthProviderUser(user: User): AuthProviderUser {
  const email = user.email?.toLowerCase();
  if (!email) {
    throw new Error("Authenticated user is missing an email address");
  }

  const metadata = user.user_metadata ?? {};
  const name =
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    email.split("@")[0];

  const role =
    metadata.role === "student" ||
    metadata.role === "lecturer" ||
    metadata.role === "admin"
      ? metadata.role
      : undefined;

  return { id: user.id, email, name, role };
}
