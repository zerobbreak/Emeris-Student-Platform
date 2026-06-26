"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  Flame,
  Heart,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

import {
  PlatformPageBody,
  PlatformPageHero,
} from "@/components/platform/PlatformPageHero";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  communityPosts,
  formatRelativeTime,
  type CommunityPost,
  type FeedFilter,
} from "@/lib/constants/communityFeed";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { cn } from "@/lib/utils";

const feedFilters: { id: FeedFilter; label: string }[] = [
  { id: "relevant", label: "Relevant" },
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function sortPosts(filter: FeedFilter): CommunityPost[] {
  const posts = [...communityPosts];

  switch (filter) {
    case "latest":
      return posts.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    case "top":
      return posts.sort((a, b) => b.reactions - a.reactions);
    default:
      return posts.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.reactions - a.reactions;
      });
  }
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <Card
      className={cn(
        "transition hover:border-primary/25 hover:shadow-sm",
        post.featured && "border-secondary/40 bg-secondary/5",
      )}
    >
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium">{post.author.name}</span>
              {post.author.course && (
                <span className="text-xs text-muted-foreground">
                  {post.author.course}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                · {formatRelativeTime(post.publishedAt)}
              </span>
              {post.featured && (
                <Badge
                  variant="secondary"
                  className="border-0 bg-secondary/20 text-secondary-foreground"
                >
                  <Flame className="size-3" />
                  Featured
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold leading-snug text-foreground hover:text-primary">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              disabled
            >
              <Heart className="size-4" />
              {post.reactions}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              disabled
            >
              <MessageCircle className="size-4" />
              {post.comments}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              disabled
            >
              <Bookmark className="size-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {post.readMinutes} min read
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityHome() {
  const [filter, setFilter] = useState<FeedFilter>("relevant");
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile(user?.id ?? null);

  const sortedPosts = useMemo(() => sortPosts(filter), [filter]);
  const firstName = user?.name.split(" ")[0] ?? "there";
  const courseLabel = getCourseLabel(profile?.course ?? null);
  const stats = profile?.stats ?? {
    projectCount: 0,
    certCount: 0,
    totalPoints: 0,
    currentLevel: "Beginner" as const,
  };

  if (!user) {
    return null;
  }

  const heroStats = [
    { label: "Projects", value: stats.projectCount },
    { label: "Points", value: stats.totalPoints },
    { label: "Level", value: stats.currentLevel },
  ];

  return (
    <div className="flex flex-col">
      <PlatformPageHero
        icon={LayoutDashboard}
        eyebrow="Home"
        title={`Welcome back, ${firstName}`}
        description={
          courseLabel
            ? `Your ${courseLabel} feed — cohort updates, project wins, and tips from across the Hive.`
            : "Your feed of cohort updates, project wins, and tips from across the Hive."
        }
        stats={heroStats}
        aside={
          <Link
            href="/community"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "w-full justify-start gap-2 border-0 bg-white/15 text-white hover:bg-white/25",
            )}
          >
            <MessageSquare className="size-4" />
            Browse projects & help requests
          </Link>
        }
      />

      <PlatformPageBody>

        <div className="sticky top-0 z-10 -mx-6 border-b border-border/60 bg-background/95 px-6 py-3 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {feedFilters.map((item) => (
              <Button
                key={item.id}
                variant={filter === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item.id)}
                className={cn(
                  filter !== item.id &&
                    "border-primary/15 hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </PlatformPageBody>
    </div>
  );
}
