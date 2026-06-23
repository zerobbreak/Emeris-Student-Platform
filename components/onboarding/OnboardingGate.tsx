"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading || !user) return;

    const onOnboarding = pathname.startsWith("/onboarding");
    const onDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

    if (!user.isOnboarded && onDashboard) {
      router.replace("/onboarding");
      return;
    }

    if (user.isOnboarded && onOnboarding) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  return children;
}
