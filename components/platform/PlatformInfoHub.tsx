"use client";

import Link from "next/link";
import {
  Award,
  FolderKanban,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCourseLabel } from "@/lib/constants/itCourses";
import type { ProfileStats, PublicProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

type PlatformInfoHubProps = {
  user: { id: string; name: string };
  profile: PublicProfile | null;
  stats: ProfileStats;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlatformInfoHub({ user, profile, stats }: PlatformInfoHubProps) {
  const firstName = user.name.split(" ")[0] ?? "there";
  const courseLabel = getCourseLabel(profile?.course ?? null);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <section className="relative overflow-hidden bg-primary px-6 py-8 text-primary-foreground sm:px-8 sm:py-10">
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
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="max-w-xl text-sm text-primary-foreground/85 sm:text-base">
              Your student platform for portfolios, skills, and recognition.
              Build your presence, showcase your work, and climb the Hive.
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
            <Avatar className="size-16 border-2 border-white/30 sm:size-20">
              <AvatarImage
                src={profile?.profileImage ?? undefined}
                alt={user.name}
              />
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

      <div className="flex-1 space-y-6 p-6">
        <section className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Projects", value: stats.projectCount, icon: FolderKanban },
            { label: "Certifications", value: stats.certCount, icon: Award },
            { label: "Hive Points", value: stats.totalPoints, icon: Sparkles },
            { label: "Level", value: stats.currentLevel, icon: Users },
          ].map((stat) => (
            <Card key={stat.label} className="border-primary/10">
              <CardContent className="flex items-center gap-4 pt-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border border-secondary/30 bg-secondary/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Ready to be seen?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your public profile is live. Share it with lecturers, mentors,
                and future employers.
              </p>
            </div>
            <Link
              href={`/profile/${user.id}`}
              className={cn(buttonVariants({ variant: "default" }), "shrink-0")}
            >
              Go to my profile
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
