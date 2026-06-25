"use client";

import { PlatformFeedPanel } from "@/components/platform/PlatformFeedPanel";
import { PlatformNavPanel } from "@/components/platform/PlatformNavPanel";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

function PlatformShellSkeleton() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="grid h-[clamp(36rem,calc(100dvh-3rem),52rem)] min-h-0 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_340px]">
        <div className="hidden h-full animate-pulse bg-muted/30 lg:block" />
        <div className="space-y-4 p-6">
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
        <div className="hidden h-full animate-pulse bg-muted/20 xl:block" />
      </div>
    </div>
  );
}

type PlatformShellProps = {
  children: React.ReactNode;
};

export function PlatformShell({ children }: PlatformShellProps) {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(user?.id ?? null);

  if (!user || isLoading) {
    return <PlatformShellSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="grid h-[clamp(36rem,calc(100dvh-3rem),52rem)] min-h-0 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_340px]">
        <div className="min-h-0 overflow-y-auto border-b p-3 lg:border-b-0 lg:border-r lg:p-4">
          <PlatformNavPanel
            userId={user.id}
            user={user}
            profileImage={profile?.profileImage}
          />
        </div>

        <div className="min-h-0 min-w-0 overflow-y-auto">{children}</div>

        <div className="hidden min-h-0 overflow-hidden xl:block">
          <PlatformFeedPanel user={user} profileImage={profile?.profileImage} />
        </div>
      </div>
    </div>
  );
}
