"use server";

import { redirect } from "next/navigation";

import { getAuthProviderUser } from "@/lib/auth/supabase-user";
import { ensureAppUser } from "@/lib/db/queries/user";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  if (role === "admin") {
    return { error: "Admin accounts cannot be self-registered" };
  }

  const appRole = role === "lecturer" ? "lecturer" : "student";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: appRole,
      },
    },
  });

  if (error) {
    return { error: error.message || "Failed to create account" };
  }

  if (data.user && data.session) {
    const providerUser = getAuthProviderUser(data.user);
    await ensureAppUser(providerUser, appRole);
    redirect("/onboarding");
  }

  redirect("/verify-email?type=signup");
}
