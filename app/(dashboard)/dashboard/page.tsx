"use client";

import { PlatformInfoHub } from "@/components/platform/PlatformInfoHub";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile(user?.id ?? null);

  const stats = profile?.stats ?? {
    projectCount: 0,
    certCount: 0,
    totalPoints: 0,
    currentLevel: "Beginner" as const,
  };

  if (!user) {
    return null;
  }

  return (
    <PlatformInfoHub user={user} profile={profile ?? null} stats={stats} />
  );
}
