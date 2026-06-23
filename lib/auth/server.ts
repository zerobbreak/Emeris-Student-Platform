import { createNeonAuth } from "@neondatabase/auth/next/server";

import { getEnv } from "@/lib/env";

const env = getEnv();

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: env.NEON_AUTH_COOKIE_SECRET,
  },
});
