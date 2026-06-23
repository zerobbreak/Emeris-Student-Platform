"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Pencil, Share2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: PublicProfile;
  isOwner?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 md:flex-row md:items-start">
      <Avatar className="size-24">
        <AvatarImage src={profile.profileImage ?? undefined} alt={profile.name} />
        <AvatarFallback className="bg-primary text-lg text-primary-foreground">
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <Badge variant="secondary" className="capitalize">
            {profile.role}
          </Badge>
        </div>
        {(profile.course || profile.year) && (
          <p className="text-muted-foreground">
            {[
              getCourseLabel(profile.course),
              profile.year ? `Year ${profile.year}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {profile.location && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {profile.location}
          </p>
        )}
        {profile.bio && <p className="max-w-2xl text-sm">{profile.bio}</p>}
        <div className="flex flex-wrap gap-2">
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ExternalLink className="size-4" />
              GitHub
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ExternalLink className="size-4" />
              LinkedIn
            </a>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="size-4" />
            Share
          </Button>
          {isOwner && (
            <Link
              href="/profile/edit"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Pencil className="size-4" />
              Edit profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
