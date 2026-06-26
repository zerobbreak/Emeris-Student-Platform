import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export default async function proxy(request: NextRequest) {
  return updateSession(request, { loginUrl: "/login" });
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding",
    "/profile/edit",
  ],
};
