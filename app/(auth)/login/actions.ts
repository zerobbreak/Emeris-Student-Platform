"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { getPostAuthRedirectPath } from "@/lib/onboarding/redirect";
import { ensureAppUser } from "@/lib/services/userSync";

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    if (error.code === "NETWORK_DNS") {
      return { error: "Check NEON_AUTH_BASE_URL in .env.local" };
    }
    return { error: error.message || "Invalid email or password" };
  }

  const { data: session } = await auth.getSession();
  if (session?.user) {
    await ensureAppUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
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
  await auth.signOut();
  redirect("/login");
}
