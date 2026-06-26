"use server";

import { redirect } from "next/navigation";

import { getAuthProviderUser } from "@/lib/auth/supabase-user";
import { getPostAuthRedirectPath } from "@/lib/onboarding/redirect";
import { ensureAppUser } from "@/lib/db/queries/user";
import { createClient } from "@/lib/supabase/server";

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message || "Invalid email or password" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const providerUser = getAuthProviderUser(user);
    await ensureAppUser(providerUser, providerUser.role);
  }

  const postAuthPath = await getPostAuthRedirectPath();
  const requested = formData.get("redirect") as string | null;
  const redirectTo =
    postAuthPath === "/onboarding"
      ? "/onboarding"
      : requested || postAuthPath;
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
