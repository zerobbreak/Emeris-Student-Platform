"use client";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { StatsBar } from "@/components/profile/StatsBar";
import { useCurrentUser } from "@/hooks/useAuth";
import type { PublicProfile } from "@/types/profile";

interface ProfileViewProps {
  profile: PublicProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const { data: user } = useCurrentUser();
  const isOwner = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <ProfileHeader profile={profile} isOwner={isOwner} />
      {profile.stats && <StatsBar stats={profile.stats} />}
      <SkillsSection
        userId={profile.id}
        skills={profile.skills ?? []}
        isOwner={isOwner}
      />
    </div>
  );
}
