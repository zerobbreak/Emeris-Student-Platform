import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile/ProfileView";
import { getPublicProfile } from "@/lib/services/profileService";

type PageProps = { params: Promise<{ id: string }> };

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getPublicProfile(id, {
    includeSkills: true,
    includeStats: true,
  });

  if (!profile) notFound();

  return (
    <div className="min-h-full bg-background">
      <ProfileView profile={profile} />
    </div>
  );
}
