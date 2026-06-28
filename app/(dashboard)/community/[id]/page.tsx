"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronLeft,
  FolderKanban,
  HandHelping,
  Heart,
  Lightbulb,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";

import { CommunityPostCommentItem } from "@/components/platform/CommunityPostComment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useCommunityPost,
  useCommunityPostComments,
  useCreateCommunityPostComment,
  useToggleCommunityPostLike,
} from "@/hooks/useCommunityPosts";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import {
  hiveProjects,
  impactCategoryLabels,
  statusLabels,
} from "@/lib/constants/hiveProjects";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/types/communityPost";

const kindMeta = {
  project: {
    label: "Project listed",
    icon: FolderKanban,
    badgeClass: "border-0 bg-primary/10 text-primary",
  },
  assistance: {
    label: "Assistance needed",
    icon: HandHelping,
    badgeClass: "border-0 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  tip: {
    label: "Improvement tip",
    icon: Lightbulb,
    badgeClass: "border-0 bg-secondary/20 text-secondary-foreground",
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

function formatAuthorLabel(author: CommunityPost["author"]) {
  const course = getCourseLabel(author.course);
  const parts = [course, author.year ? `Year ${author.year}` : null].filter(Boolean);
  return parts.join(" · ");
}

function getProjectGradient(projectId?: string) {
  const project = hiveProjects.find((item) => item.id === projectId);
  return project?.thumbnailGradient ?? "from-primary/70 to-accent/50";
}

export default function CommunityPostDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const postId = params.id;

  const { data: user } = useCurrentUser();
  const { data: post, isLoading: isPostLoading } = useCommunityPost(postId);
  const { data: comments = [], isLoading: isCommentsLoading } = useCommunityPostComments(postId);
  const { mutate: addComment, isPending: isAddingComment } = useCreateCommunityPostComment();
  const { mutate: toggleLike, isPending: isLiking } = useToggleCommunityPostLike();

  const [commentText, setCommentText] = useState("");

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
        <Link href="/community">
          <Button variant="outline">
            <ChevronLeft className="mr-2 size-4" />
            Back to Community
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

  const isPostCreator = user?.id === post.author.id;

  const topLevelComments = comments.filter((c) => !c.replyToId);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.replyToId) {
      if (!acc[c.replyToId]) acc[c.replyToId] = [];
      acc[c.replyToId].push(c);
    }
    return acc;
  }, {} as Record<string, typeof comments>);

  const meta = kindMeta[post.kind];
  const KindIcon = meta.icon;
  const authorLabel = formatAuthorLabel(post.author);
  const referencedProject = post.projectId
    ? hiveProjects.find((item) => item.id === post.projectId)
    : undefined;

  return (
    <div className="mx-auto max-w-5xl py-6 space-y-8">
      <div>
        <Link
          href="/community"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Back to Community
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn("gap-1", meta.badgeClass)}>
                <KindIcon className="size-3" />
                {meta.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 py-2">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={post.author.profileImage ?? undefined} alt={post.author.name} />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.author.name}</p>
                {authorLabel && (
                  <p className="text-xs text-muted-foreground">{authorLabel}</p>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
              {post.excerpt}
            </p>
          </div>

          {post.kind === "assistance" && post.assistanceArea && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Help needed with
              </p>
              <p className="mt-0.5 font-medium">
                {post.assistanceArea}
              </p>
            </div>
          )}

          {post.kind === "tip" && post.tipFocus && (
            <div className="rounded-lg border border-secondary/25 bg-secondary/10 px-4 py-3">
              <p className="text-xs font-medium text-secondary-foreground">
                Focus area
              </p>
              <p className="mt-0.5 font-medium">{post.tipFocus}</p>
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-primary/15 bg-primary/5 text-primary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 border-y border-border/40 py-3">
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
                toggleLike(post.id);
              }}
            >
              <Heart className={cn("mr-1.5 size-4", post.hasLiked && "fill-current")} />
              {post.likeCount} Likes
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <MessageCircle className="mr-1.5 size-4" />
              {post.commentCount} Comments
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Bookmark className="mr-1.5 size-4" />
              Save
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

            {!isPostCreator && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/50 p-4 shadow-sm">
                <Textarea
                  placeholder="Add to the discussion..."
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
                    {isAddingComment ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isCommentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to start the conversation!
                </div>
              ) : (
                topLevelComments.map((comment) => (
                  <CommunityPostCommentItem 
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

        {/* Sidebar Column */}
        <div className="md:col-span-1 space-y-6">
          {referencedProject ? (
            <Card className="sticky top-24 overflow-hidden border-primary/20">
              <div className={cn("h-2 w-full bg-linear-to-r", getProjectGradient(referencedProject.id))} />
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referenced Project
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight">
                    {referencedProject.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className="bg-primary/5">
                      {statusLabels[referencedProject.status]}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Impact Category</p>
                    <span className="text-sm">{impactCategoryLabels[referencedProject.impactCategory]}</span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {referencedProject.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">The Problem</p>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {referencedProject.problemStatement}
                    </p>
                  </div>

                  {referencedProject.technologies.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Technologies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {referencedProject.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[10px] font-normal">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href={`/hive-projects?id=${referencedProject.id}`}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full")}
                  >
                    View Project Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : post.projectTitle ? (
            <Card className="sticky top-24 overflow-hidden border-primary/20">
              <div className={cn("h-2 w-full bg-linear-to-r", getProjectGradient())} />
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referenced Project
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight">
                    {post.projectTitle}
                  </h3>
                </div>
                
                {post.projectStatus && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className="bg-primary/5">
                      {statusLabels[post.projectStatus]}
                    </Badge>
                  </div>
                )}

                {post.technologies && post.technologies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Technologies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px] font-normal">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                This post is not linked to a specific Hive Project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
