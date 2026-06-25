"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(user?.id ?? null);

  useEffect(() => {
    if (user && profile && user.id !== profile.id) {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, profile, router]);

  if (!user || isLoading) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-muted-foreground">Profile not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Edit profile</h1>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
