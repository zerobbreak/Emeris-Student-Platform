"use client";

import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <OnboardingGate>
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-lg font-bold text-primary">HIVE Showcase</p>
            <p className="text-xs text-muted-foreground">
              EMERIS student portfolio platform
            </p>
          </div>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Sign out
            </Button>
          )}
        </header>
        <main className="flex flex-1 flex-col items-center px-4 py-10">
          {children}
        </main>
      </div>
    </OnboardingGate>
  );
}
