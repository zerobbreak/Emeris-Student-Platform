import { apiError, apiSuccess } from "@/lib/api/response";
import { isSession, requireAuth } from "@/lib/auth/requireAuth";
import { getFeedPosts } from "@/lib/services/feedService";

export async function GET() {
  const session = await requireAuth();
  if (!isSession(session)) return session;

  try {
    const posts = await getFeedPosts();
    return apiSuccess(posts);
  } catch (error) {
    console.error("Feed fetch error:", error);
    return apiError("INTERNAL_ERROR", "Failed to load feed", 500);
  }
}
