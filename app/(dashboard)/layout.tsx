import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { PlatformShell } from "@/components/platform/PlatformShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGate>
      <PlatformShell>{children}</PlatformShell>
    </OnboardingGate>
  );
}
