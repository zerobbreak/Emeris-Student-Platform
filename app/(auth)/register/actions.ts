"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { ensureAppUser } from "@/lib/services/userSync";
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

  const { data, error } = await auth.signUp.email({
    email,
    name,
    password,
  });

  if (error) {
    if (error.code === "NETWORK_DNS") {
      return { error: "Check NEON_AUTH_BASE_URL in .env.local" };
    }
    return { error: error.message || "Failed to create account" };
  }

  const neonUser = data?.user ?? (await auth.getSession()).data?.user;
  if (neonUser) {
    await ensureAppUser(
      {
        id: neonUser.id,
        email: neonUser.email,
        name: neonUser.name,
      },
      role === "lecturer" ? "lecturer" : "student",
    );
  }

  redirect("/onboarding");
}
