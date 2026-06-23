import { auth } from "@/lib/auth/server";
import { ensureAppUser } from "@/lib/services/userSync";

export async function getPostAuthRedirectPath(): Promise<string> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return "/login";

  const appUser = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  return appUser.isOnboarded ? "/dashboard" : "/onboarding";
}
