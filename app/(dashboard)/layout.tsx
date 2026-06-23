"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/community", label: "Community" },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <OnboardingGate>
      <div className="flex min-h-full flex-1">
        <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
          <div className="mb-8">
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              HIVE Showcase
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition hover:bg-muted",
                  pathname === item.href &&
                    "bg-primary/10 font-medium text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href={`/profile/${user.id}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition hover:bg-muted",
                  pathname.startsWith("/profile") &&
                    "bg-primary/10 font-medium text-primary",
                )}
              >
                My Profile
              </Link>
            )}
          </nav>
          <Separator className="my-4" />
          {user && (
            <div className="space-y-2">
              <p className="truncate px-3 text-sm font-medium">{user.name}</p>
              <p className="truncate px-3 text-xs text-muted-foreground">
                {user.email}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                Sign out
              </Button>
            </div>
          )}
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b px-6 py-4 md:hidden">
            <Link href="/dashboard" className="font-bold text-primary">
              HIVE
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
            >
              Sign out
            </Button>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </OnboardingGate>
  );
}
