"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const platformModules = [
  {
    title: "Home",
    description: "Your feed and cohort updates",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
    match: (path: string) => path === "/dashboard",
  },
  {
    title: "Hive Community",
    description: "Projects, help requests, and tips",
    href: "/community",
    icon: MessageSquare,
    active: true,
    match: (path: string) => path.startsWith("/community"),
  },
  {
    title: "Hive Projects",
    description: "Coursework and personal builds",
    href: "/hive-projects",
    icon: FolderKanban,
    active: true,
    match: (path: string) => path.startsWith("/hive-projects"),
  },
  {
    title: "Skills Board",
    description: "Track skills and endorsements",
    icon: Sparkles,
    active: false,
  },
  {
    title: "Leaderboards",
    description: "Points, projects, and recognition",
    icon: Trophy,
    active: false,
  },
] as const;

type PlatformNavPanelProps = {
  userId: string;
  user: { name: string };
  profileImage?: string | null;
};

export function PlatformNavPanel({
  userId,
  user,
  profileImage,
}: PlatformNavPanelProps) {
  const pathname = usePathname();
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <nav
      aria-label="Platform navigation"
      className="flex flex-col bg-card lg:rounded-xl lg:border lg:bg-muted/30"
    >
      <div className="border-b px-4 py-4 lg:px-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explore
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump between Hive modules
        </p>
      </div>

      <ul className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-x-visible lg:p-3">
        {platformModules.map((module) => {
          const Icon = module.icon;
          const href =
            module.active && "href" in module ? module.href : undefined;
          const isCurrent =
            module.active && "match" in module && module.match(pathname);

          const content = (
            <>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : module.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1 lg:block">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      isCurrent && "text-primary",
                    )}
                  >
                    {module.title}
                  </span>
                  {!module.active && (
                    <Badge variant="secondary" className="hidden text-[10px] lg:inline-flex">
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="hidden truncate text-xs text-muted-foreground lg:block">
                  {module.description}
                </p>
              </div>
            </>
          );

          const itemClass = cn(
            "flex min-w-[9rem] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 transition lg:min-w-0 lg:shrink",
            module.active && !isCurrent && "hover:bg-primary/5",
            isCurrent && "bg-primary/10 ring-1 ring-primary/20",
            !module.active && "cursor-not-allowed opacity-60",
          );

          if (href) {
            return (
              <li key={module.title} className="lg:w-full">
                <Link href={href} className={itemClass}>
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={module.title} className="lg:w-full">
              <div className={itemClass} aria-disabled>
                {content}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t p-3">
        <Link
          href={`/profile/${userId}`}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-primary/5",
            isProfileActive && "bg-primary/10 ring-1 ring-primary/20",
          )}
        >
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={profileImage ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{user.name}</span>
        </Link>
      </div>
    </nav>
  );
}
