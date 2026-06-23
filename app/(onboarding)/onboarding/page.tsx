import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold">Set up your profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Complete the steps below to unlock your dashboard. We&apos;ll pick up
        where you left off based on your saved profile.
      </p>
      <OnboardingForm />
    </div>
  );
}
