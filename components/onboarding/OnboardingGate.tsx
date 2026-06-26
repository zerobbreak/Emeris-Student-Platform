"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const onOnboarding = pathname.startsWith("/onboarding");
    const isProtected = !pathname.startsWith("/login") && !pathname.startsWith("/register");

    // Not logged in — send to login
    if (!user) {
      if (isProtected) {
        router.replace("/login");
      }
      return;
    }

    // Logged-in but NOT onboarded — force to onboarding
    if (!user.isOnboarded && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }

    // Logged-in and already onboarded — get off onboarding
    if (user.isOnboarded && onOnboarding) {
      router.replace("/dashboard");
      return;
    }

    // All good
    setAllowed(true);
  }, [user, isLoading, pathname, router]);

  // Block rendering until we've confirmed the user belongs on this page
  if (isLoading || !allowed) {
    return null;
  }

  return children;
}
