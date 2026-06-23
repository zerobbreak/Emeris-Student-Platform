import { apiError, apiSuccess } from "@/lib/api/response";
import { auth } from "@/lib/auth/server";
import { ensureAppUser, toAuthUser } from "@/lib/services/userSync";

export async function GET() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const appUser = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  return apiSuccess(toAuthUser(appUser));
}
