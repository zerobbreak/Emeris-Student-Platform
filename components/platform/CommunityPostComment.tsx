"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import type { CommunityPostComment } from "@/types/communityPost";
import { getCourseLabel } from "@/lib/constants/itCourses";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityPostCommentItem({ comment }: { comment: CommunityPostComment }) {
  const courseLabel = getCourseLabel(comment.author.course);
  const authorLabel = [
    courseLabel, 
    comment.author.year ? `Year ${comment.author.year}` : null
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border/40 bg-background hover:bg-muted/30 transition-colors">
      <Avatar className="size-8 shrink-0">
        <AvatarImage
          src={comment.author.profileImage ?? undefined}
          alt={comment.author.name}
        />
        <AvatarFallback className="bg-primary/10 text-xs text-primary">
          {getInitials(comment.author.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">{comment.author.name}</span>
          {authorLabel ? (
            <span className="text-xs text-muted-foreground">{authorLabel}</span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            · {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        
        <p className="text-sm leading-relaxed text-foreground mt-2 whitespace-pre-wrap">
          {comment.text}
        </p>
      </div>
    </div>
  );
}
