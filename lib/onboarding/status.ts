import type { PublicProfile } from "@/types/profile";

export const ONBOARDING_STEP_COUNT = 4;

export function isStep1Complete(profile: Pick<PublicProfile, "course" | "year">) {
  return Boolean(profile.course && profile.year);
}

export function isStep2Complete(profile: PublicProfile) {
  if (profile.githubUrl || profile.linkedinUrl) return true;
  if ((profile.skills?.length ?? 0) > 0) return true;
  if (profile.profileImage) return true;
  if (profile.isOnboarded) return true;
  return false;
}

export function isStep3Complete(profile: Pick<PublicProfile, "skills">) {
  return (profile.skills?.length ?? 0) >= 1;
}

export function isStep4Complete(
  profile: Pick<PublicProfile, "profileImage" | "isOnboarded">,
) {
  return Boolean(profile.profileImage || profile.isOnboarded);
}

export function getFirstIncompleteStep(profile: PublicProfile): number {
  if (!isStep1Complete(profile)) return 1;
  if (!isStep2Complete(profile)) return 2;
  if (!isStep3Complete(profile)) return 3;
  if (!isStep4Complete(profile)) return 4;
  return 4;
}

export function isOnboardingDataComplete(profile: PublicProfile): boolean {
  return (
    isStep1Complete(profile) &&
    isStep2Complete(profile) &&
    isStep3Complete(profile)
  );
}

export function getOnboardingProgress(profile: PublicProfile): number {
  let completed = 0;
  if (isStep1Complete(profile)) completed += 1;
  if (isStep2Complete(profile)) completed += 1;
  if (isStep3Complete(profile)) completed += 1;
  if (isStep4Complete(profile)) completed += 1;
  return Math.round((completed / ONBOARDING_STEP_COUNT) * 100);
}
