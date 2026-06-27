"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Both password fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();
  
  // Update the user's password using the active session from PKCE
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  // Password reset successfully, log them out to force a clean login with new password 
  // or simply redirect to dashboard. Let's redirect to login for security.
  await supabase.auth.signOut();
  redirect("/login?reset=success");
}
