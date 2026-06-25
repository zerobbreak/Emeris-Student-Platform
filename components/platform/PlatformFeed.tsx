"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  PenLine,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useFeed } from "@/hooks/useFeed";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import type { FeedComment, FeedPost } from "@/types/feed";
import { cn } from "@/lib/utils";

type PlatformFeedProps = {
  user: { id: string; name: string };
  profileImage?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function authorSubtitle(author: FeedPost["author"]) {
  const course = getCourseLabel(author.course);
  const parts = [course, author.year ? `Year ${author.year}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

function CommentItem({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex gap-2.5">
      <Avatar className="size-7 shrink-0">
        <AvatarImage
          src={comment.author.profileImage ?? undefined}
          alt={comment.author.name}
        />
        <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
          {getInitials(comment.author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-medium">{comment.author.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.likedByCreator && (
              <Badge
                variant="secondary"
                className="h-4 border-0 bg-secondary/20 px-1.5 text-[9px] text-secondary-foreground"
              >
                <Heart className="size-2.5 fill-current" />
                Liked by creator
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {comment.text}
          </p>
        </div>
        <div className="flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3" />
            {comment.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="size-3" />
            {comment.dislikeCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const subtitle = authorSubtitle(post.author);

  return (
    <Card className="border-primary/10 transition hover:border-primary/20">
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
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">{post.author.name}</span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
              <span className="text-xs text-muted-foreground">
                · {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {post.text}
            </p>
          </div>
        </div>

        {post.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-primary/10 bg-muted">
            <Image
              src={post.imageUrl}
              alt="Post attachment"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground"
              disabled
            >
              <ThumbsUp className="size-4" />
              {post.likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground"
              disabled
            >
              <ThumbsDown className="size-4" />
              {post.dislikeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-muted-foreground hover:text-primary",
                commentsOpen && "text-primary",
              )}
              onClick={() => setCommentsOpen((open) => !open)}
            >
              <MessageCircle className="size-4" />
              {post.commentCount}
              {commentsOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {commentsOpen && post.comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Comments on this post
              </p>
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </>
        )}

        {commentsOpen && post.comments.length === 0 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export function PlatformFeed({ user, profileImage }: PlatformFeedProps) {
  const { data: posts, isLoading, isError } = useFeed();
  const firstName = user.name.split(" ")[0] ?? "there";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <section className="border-b bg-primary px-6 py-6 text-primary-foreground sm:px-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Hive Feed
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/85">
          What&apos;s happening in the community, {firstName}
        </p>
      </section>

      <div className="flex-1 space-y-5 p-6">
        <Card className="border-primary/15">
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-start gap-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={profileImage ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Share an update with the Hive..."
                className="min-h-16 resize-none border-primary/15 text-sm focus-visible:ring-primary"
                disabled
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Creating posts opens in a future update
              </p>
              <Button size="sm" disabled>
                <PenLine className="size-4" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && <FeedSkeleton />}

        {isError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Could not load the feed. Try refreshing the page.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && posts?.length === 0 && (
          <Card className="border-primary/10">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No posts yet. Check back soon.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && posts && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
