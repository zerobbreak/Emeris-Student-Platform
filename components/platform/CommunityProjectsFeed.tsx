"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  FolderKanban,
  HandHelping,
  Heart,
  Lightbulb,
  MessageCircle,
  Users,
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
import { useCommunityPosts, useToggleCommunityPostLike } from "@/hooks/useCommunityPosts";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import type { CommunityPostFilter } from "@/lib/constants/communityProjectPosts";
import { getCourseLabel } from "@/lib/constants/itCourses";
import {
  hiveProjects,
  statusLabels,
} from "@/lib/constants/hiveProjects";
import type { CommunityPost } from "@/types/communityPost";
import { cn } from "@/lib/utils";

const feedFilters: { id: CommunityPostFilter; label: string }[] = [
  { id: "all", label: "All posts" },
  { id: "project", label: "Projects" },
  { id: "assistance", label: "Need help" },
  { id: "tip", label: "Tips" },
];

const kindMeta = {
  project: {
    label: "Project listed",
    icon: FolderKanban,
    badgeClass: "border-0 bg-primary/10 text-primary",
    cardClass: "border-primary/20",
  },
  assistance: {
    label: "Assistance needed",
    icon: HandHelping,
    badgeClass: "border-0 bg-amber-500/15 text-amber-800 dark:text-amber-200",
    cardClass: "border-amber-500/25 bg-amber-500/[0.03]",
  },
  tip: {
    label: "Improvement tip",
    icon: Lightbulb,
    badgeClass: "border-0 bg-secondary/20 text-secondary-foreground",
    cardClass: "border-secondary/30 bg-secondary/5",
  },
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProjectGradient(projectId?: string) {
  const project = hiveProjects.find((item) => item.id === projectId);
  return project?.thumbnailGradient ?? "from-primary/70 to-accent/50";
}

function formatAuthorLabel(author: CommunityPost["author"]) {
  const course = getCourseLabel(author.course);
  const parts = [course, author.year ? `Year ${author.year}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export function PostCard({ post }: { post: CommunityPost }) {
  const meta = kindMeta[post.kind];
  const KindIcon = meta.icon;
  const authorLabel = formatAuthorLabel(post.author);
  const referencedProject = post.projectId
    ? hiveProjects.find((item) => item.id === post.projectId)
    : undefined;

  const { mutate: toggleLike, isPending: isLiking } = useToggleCommunityPostLike();

  const handleLike = () => {
    toggleLike(post.id);
  };

  return (
    <Card
      className={cn(
        "transition hover:border-primary/25 hover:shadow-sm",
        meta.cardClass,
        post.featured && post.kind === "project" && "ring-1 ring-secondary/30",
      )}
    >
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={post.author.profileImage ?? undefined}
              alt={post.author.name}
            />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium">{post.author.name}</span>
              {authorLabel ? (
                <span className="text-xs text-muted-foreground">
                  {authorLabel}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                · {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            <Badge variant="outline" className={cn("gap-1", meta.badgeClass)}>
              <KindIcon className="size-3" />
              {meta.label}
            </Badge>
            <Link href={`/community/${post.id}`}>
              <h3 className="text-lg font-semibold leading-snug text-foreground hover:text-primary">
                {post.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          </div>
        </div>

        {post.kind === "project" && post.projectTitle && (
          <div
            className={cn(
              "overflow-hidden rounded-lg border border-primary/10 bg-linear-to-br p-4",
              getProjectGradient(post.projectId ?? undefined),
            )}
          >
            <div className="rounded-lg bg-black/25 p-3 text-white backdrop-blur-[2px]">
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                Hive project
              </p>
              <p className="mt-1 font-semibold">{post.projectTitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {post.projectStatus && (
                  <Badge className="border-0 bg-white/20 text-[10px] text-white">
                    {statusLabels[post.projectStatus]}
                  </Badge>
                )}
                {post.technologies?.slice(0, 3).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="border-white/30 bg-white/10 text-[10px] text-white"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {post.kind === "assistance" && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            {post.projectTitle ? (
              <div className="mb-3 rounded-md border border-amber-500/15 bg-background/70 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
                  Referenced project
                </p>
                <p className="mt-0.5 text-sm font-semibold">{post.projectTitle}</p>
                {referencedProject ? (
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className="border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100"
                    >
                      {statusLabels[referencedProject.status]}
                    </Badge>
                  </div>
                ) : null}
              </div>
            ) : null}
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              Help needed with
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {post.assistanceArea ?? "General project support"}
            </p>
          </div>
        )}

        {post.kind === "tip" && post.tipFocus && (
          <div className="rounded-lg border border-secondary/25 bg-secondary/10 px-4 py-3">
            <p className="text-xs font-medium text-secondary-foreground">
              Focus area
            </p>
            <p className="mt-0.5 text-sm font-medium">{post.tipFocus}</p>
          </div>
        )}

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
              className={cn(
                "text-muted-foreground hover:text-primary",
                post.hasLiked && "text-red-500 hover:text-red-600",
                isLiking && "pointer-events-none"
              )}
              onClick={(e) => {
                e.preventDefault();
                handleLike();
              }}
            >
              <Heart className={cn("size-4", post.hasLiked && "fill-current")} />
              {post.likeCount}
            </Button>
            <Link href={`/community/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="size-4" />
                {post.commentCount}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              disabled
            >
              <Bookmark className="size-4" />
            </Button>
          </div>
          {post.kind === "assistance" && (
            <Button size="sm" variant="outline" disabled className="text-xs">
              <HandHelping className="size-3.5" />
              Offer help
            </Button>
          )}
          {post.kind === "project" && post.projectId && (
            <Link
              href="/hive-projects"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
            >
              View in gallery
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityProjectsFeed() {
  const [filter, setFilter] = useState<CommunityPostFilter>("all");
  const { data: user } = useCurrentUser();
  const { data: posts = [], isLoading, isError } = useCommunityPosts("all");

  const sortedPosts = useMemo(() => {
    const filtered =
      filter === "all" ? posts : posts.filter((post) => post.kind === filter);
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [posts, filter]);

  const counts = useMemo(
    () => ({
      project: posts.filter((p) => p.kind === "project").length,
      assistance: posts.filter((p) => p.kind === "assistance").length,
      tip: posts.filter((p) => p.kind === "tip").length,
    }),
    [posts],
  );

  const firstName = user?.name.split(" ")[0] ?? "there";

  if (!user) {
    return null;
  }

  const heroStats = [
    { label: "Listed", value: counts.project },
    { label: "Need help", value: counts.assistance },
    { label: "Tips", value: counts.tip },
  ];

  return (
    <div className="flex flex-col">
      <PlatformPageHero
        icon={Users}
        eyebrow="Hive Community"
        title={`Projects & peer support, ${firstName}`}
        description="Browse listed Hive projects, jump in where teams need help, and pick up tips to improve your own builds before showcase week."
        stats={heroStats}
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-xl bg-muted"
              />
            ))
          ) : isError ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Could not load community posts. Try refreshing the page.
              </CardContent>
            </Card>
          ) : sortedPosts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No posts in this category yet.
              </CardContent>
            </Card>
          ) : (
            sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </PlatformPageBody>
    </div>
  );
}
