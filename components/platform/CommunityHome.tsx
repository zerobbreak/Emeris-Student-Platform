"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  Flame,
  Heart,
  MessageCircle,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  communityPosts,
  formatRelativeTime,
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
  const { data: profile } = useProfile(user?.id ?? null);

  const sortedPosts = useMemo(() => sortPosts(filter), [filter]);
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <section className="relative overflow-hidden bg-primary px-6 py-8 text-primary-foreground sm:px-10">
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
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Learn together, {firstName}
            </h1>
            <p className="max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
              Share project wins, ask for feedback, and discover what other
              EMERIS IT students are building.
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

      <div className="flex-1 space-y-5 p-6">
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
    </div>
  );
}
