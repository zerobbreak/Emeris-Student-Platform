"use client";

import Link from "next/link";
import {
  Award,
  FolderKanban,
  MessageSquare,
  Pencil,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { cn } from "@/lib/utils";

const platformModules = [
  {
    title: "My Profile",
    description: "View and share your public portfolio with lecturers and partners.",
    href: (userId: string) => `/profile/${userId}`,
    icon: User,
    active: true,
  },
  {
    title: "Hive Community",
    description: "Read student posts, share tips, and learn from the cohort.",
    href: (_userId: string) => "/community",
    icon: MessageSquare,
    active: true,
  },
  {
    title: "Hive Projects",
    description: "Upload and showcase your coursework and personal builds.",
    icon: FolderKanban,
    active: false,
  },
  {
    title: "Skills Board",
    description: "Track skills, earn endorsements, and grow your expertise.",
    icon: Sparkles,
    active: false,
  },
  {
    title: "Leaderboards",
    description: "See how you rank across points, projects, and recognition.",
    icon: Trophy,
    active: false,
  },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlatformHome() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(user?.id ?? null);

  const stats = profile?.stats ?? {
    projectCount: 0,
    certCount: 0,
    totalPoints: 0,
    currentLevel: "Beginner" as const,
  };

  const firstName = user?.name.split(" ")[0] ?? "there";
  const courseLabel = getCourseLabel(profile?.course ?? null);

  if (!user || isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground shadow-lg sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #7ec8a4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c6a45b 0%, transparent 45%)",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="border-0 bg-white/15 text-primary-foreground"
            >
              EMERIS IT · HIVE Showcase
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="max-w-xl text-primary-foreground/85">
              Your student platform for portfolios, skills, and recognition. Build
              your presence, showcase your work, and climb the Hive.
            </p>
            {(courseLabel || profile?.year) && (
              <p className="text-sm text-primary-foreground/75">
                {[courseLabel, profile?.year ? `Year ${profile.year}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-2 border-white/30">
              <AvatarImage src={profile?.profileImage ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary-foreground/10 text-lg text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Link
                href={`/profile/${user.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "bg-white text-primary hover:bg-white/90",
                )}
              >
                View profile
              </Link>
              <Link
                href="/profile/edit"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10",
                )}
              >
                <Pencil className="size-3.5" />
                Edit profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projects", value: stats.projectCount, icon: FolderKanban },
          { label: "Certifications", value: stats.certCount, icon: Award },
          { label: "Hive Points", value: stats.totalPoints, icon: Sparkles },
          { label: "Level", value: stats.currentLevel, icon: Users, isText: true },
        ].map((stat) => (
          <Card key={stat.label} className="border-primary/10">
            <CardContent className="flex items-center gap-4 pt-0">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {stat.isText ? stat.value : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Explore the platform</h2>
          <p className="text-sm text-muted-foreground">
            Jump into your profile today — more modules arrive as the Hive grows.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {platformModules.map((module) => {
            const Icon = module.icon;
            const href =
              module.active && "href" in module
                ? module.href(user.id)
                : undefined;

            const card = (
              <Card
                className={cn(
                  "h-full transition",
                  module.active
                    ? "hover:border-primary/30 hover:shadow-md"
                    : "opacity-80",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    {!module.active && (
                      <Badge variant="secondary" className="text-xs">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                {module.active && href && (
                  <CardContent className="pt-0">
                    <span className="text-sm font-medium text-primary">
                      Open →
                    </span>
                  </CardContent>
                )}
              </Card>
            );

            if (href) {
              return (
                <Link key={module.title} href={href} className="block">
                  {card}
                </Link>
              );
            }

            return (
              <div key={module.title} aria-disabled className="cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-secondary/30 bg-secondary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              Ready to be seen?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your public profile is live. Share it with lecturers, mentors, and
              future employers.
            </p>
          </div>
          <Link
            href={`/profile/${user.id}`}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Go to my profile
          </Link>
        </div>
      </section>
    </div>
  );
}
