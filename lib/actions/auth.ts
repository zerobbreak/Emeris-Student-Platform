"use server";

import { getAuthProviderUser } from "@/lib/auth/supabase-user";
import { ensureAppUser, toAuthUser } from "@/lib/db/queries/user";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const providerUser = getAuthProviderUser(user);
  const appUser = await ensureAppUser(providerUser, providerUser.role);

  return toAuthUser(appUser);
}
