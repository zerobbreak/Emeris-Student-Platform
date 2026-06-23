"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Flame,
  Heart,
  MessageCircle,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  communityPosts,
  communityTags,
  formatRelativeTime,
  trendingTopics,
  type CommunityPost,
  type FeedFilter,
} from "@/lib/constants/communityFeed";
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
  const { data: profile, isLoading } = useProfile(user?.id ?? null);

  const sortedPosts = useMemo(() => sortPosts(filter), [filter]);
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (!user || isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[200px_1fr_280px]">
          <div className="hidden h-64 animate-pulse rounded-xl bg-muted lg:block" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="hidden h-64 animate-pulse rounded-xl bg-muted xl:block" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-lg sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 85%, #7ec8a4 0%, transparent 50%), radial-gradient(circle at 85% 15%, #c6a45b 0%, transparent 45%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="border-0 bg-white/15 text-primary-foreground"
            >
              <Users className="size-3" />
              Hive Community
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn together, {firstName}
            </h1>
            <p className="max-w-2xl text-primary-foreground/85">
              Share project wins, ask for feedback, and discover what other EMERIS
              IT students are building — a dev-community space for the Hive.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <Sparkles className="size-5 text-secondary" />
            <div>
              <p className="text-sm font-medium">Community preview</p>
              <p className="text-xs text-primary-foreground/75">
                Posts & reactions ship in Phase 2
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_280px]">
        <aside className="hidden lg:block">
          <Card className="sticky top-6 border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Popular tags</CardTitle>
              <CardDescription className="text-xs">
                Topics students are discussing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {communityTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-primary/5 hover:text-primary"
                  disabled
                >
                  <span>{tag.label}</span>
                  <span className="text-xs text-muted-foreground">{tag.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-5">
          <Card className="border-primary/15">
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  <AvatarImage
                    src={profile?.profileImage ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Share an update, tip, or question with the Hive..."
                  className="min-h-20 resize-none border-primary/15 focus-visible:ring-primary"
                  disabled
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Writing posts opens when community features launch.
                </p>
                <Button size="sm" disabled>
                  <PenLine className="size-4" />
                  Create post
                </Button>
              </div>
            </CardContent>
          </Card>

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

          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="hidden space-y-4 xl:block">
          <Card className="sticky top-6 border-secondary/30 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-secondary" />
                Trending on Hive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {trendingTopics.map((topic, index) => (
                <div key={topic.title}>
                  <p className="text-sm font-medium leading-snug">{topic.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.posts} posts this week
                  </p>
                  {index < trendingTopics.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Your Hive presence</CardTitle>
              <CardDescription className="text-xs">
                Build credibility before you post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground">
                A complete profile helps lecturers and peers recognise your work
                when discussions go live.
              </p>
              <Link
                href={`/profile/${user.id}`}
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full")}
              >
                View my profile
              </Link>
              <Link
                href="/profile/edit"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full border-primary/20",
                )}
              >
                Edit profile
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
