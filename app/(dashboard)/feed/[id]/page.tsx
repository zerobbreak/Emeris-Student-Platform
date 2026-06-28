"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Send, CornerDownRight } from "lucide-react";
import Image from "next/image";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FeedPostCommentItem } from "@/components/platform/FeedPostComment";

import { useFeedPost, useCreateFeedPostComment } from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import { getCourseLabel } from "@/lib/constants/itCourses";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function authorSubtitle(author: { course: string | null; year: number | null }) {
  const course = getCourseLabel(author.course);
  const parts = [course, author.year ? `Year ${author.year}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export default function FeedPostDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const postId = params.id;

  const { data: user } = useCurrentUser();
  const { data: post, isLoading: isPostLoading } = useFeedPost(postId);
  const { mutate: addComment, isPending: isAddingComment } = useCreateFeedPostComment();

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  if (isPostLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold">Post not found</p>
        <p className="text-sm text-muted-foreground">The post you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ChevronLeft className="mr-2 size-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment(
      { postId, text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const subtitle = authorSubtitle(post.author);

  const topLevelComments = post.comments.filter((c) => !c.replyToId);
  const repliesByParent = post.comments.reduce((acc, c) => {
    if (c.replyToId) {
      if (!acc[c.replyToId]) acc[c.replyToId] = [];
      acc[c.replyToId].push(c);
    }
    return acc;
  }, {} as Record<string, typeof post.comments>);

  const isPostCreator = user?.id === post.author.id;

  return (
    <div className="mx-auto max-w-3xl py-6 space-y-6">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="border-primary/10">
        <CardContent className="space-y-4 pt-6">
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
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground mt-2">
                {post.text}
              </p>
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-primary/10 bg-muted mt-4">
              <Image
                src={post.imageUrl}
                alt="Post attachment"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
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
                className="h-8 gap-1.5 text-muted-foreground text-primary pointer-events-none"
              >
                <MessageCircle className="size-4" />
                {post.commentCount}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold">Comments ({post.comments.length})</h3>

        {/* Comment Input (Hidden for post creator) */}
        {!isPostCreator && (
          <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/50 p-4 shadow-sm">
            <Textarea
              placeholder="Write a comment..."
              className="min-h-[100px] resize-y bg-background"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isAddingComment}
                size="sm"
                className="gap-2"
              >
                {isAddingComment && !replyingTo ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to start the conversation!
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <FeedPostCommentItem 
                key={comment.id} 
                comment={comment}
                repliesByParent={repliesByParent}
                postId={postId}
                postAuthorName={post.author.name}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
