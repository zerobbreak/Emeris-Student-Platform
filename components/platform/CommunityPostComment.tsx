"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/constants/communityFeed";
import type { CommunityPostComment } from "@/types/communityPost";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { Heart, ThumbsUp, ThumbsDown, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreateCommunityPostComment, useToggleCommunityPostCommentLike, useToggleCommunityPostCommentDislike } from "@/hooks/useCommunityPosts";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityPostCommentItem({ 
  comment, 
  repliesByParent,
  postId,
  postAuthorName,
  isNested = false
}: { 
  comment: CommunityPostComment;
  repliesByParent: Record<string, CommunityPostComment[]>;
  postId: string;
  postAuthorName: string;
  isNested?: boolean;
}) {
  const courseLabel = getCourseLabel(comment.author.course);
  const authorLabel = [
    courseLabel, 
    comment.author.year ? `Year ${comment.author.year}` : null
  ].filter(Boolean).join(" · ");

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { mutate: addComment, isPending: isAddingComment } = useCreateCommunityPostComment();
  const { mutate: toggleLike, isPending: isTogglingLike } = useToggleCommunityPostCommentLike();
  const { mutate: toggleDislike, isPending: isTogglingDislike } = useToggleCommunityPostCommentDislike();

  const handleLike = () => {
    toggleLike({ postId, commentId: comment.id });
  };

  const handleDislike = () => {
    toggleDislike({ postId, commentId: comment.id });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    addComment(
      { 
        postId, 
        text: replyText, 
        replyToId: comment.id,
        threadId: comment.threadId || comment.id
      },
      {
        onSuccess: () => {
          setReplyText("");
          setIsReplying(false);
        }
      }
    );
  };

  return (
    <div className="flex flex-col">
      <div className={`flex gap-3 transition-colors ${
        !isNested ? 'p-4 rounded-xl border border-border/40 bg-background hover:bg-muted/30' : 'pt-3 pb-1'
      }`}>
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
        
        <p className="text-sm leading-relaxed text-foreground mt-2 whitespace-pre-wrap">
          {comment.text}
        </p>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
            <button 
              className={`inline-flex items-center gap-1 transition-colors hover:text-primary disabled:opacity-50 ${comment.hasLiked ? 'text-primary' : ''}`}
              onClick={handleLike}
              disabled={isTogglingLike}
            >
              <ThumbsUp className={`size-3 ${comment.hasLiked ? 'fill-current' : ''}`} />
              {comment.likeCount}
            </button>
            <button 
              className={`inline-flex items-center gap-1 transition-colors hover:text-red-500 disabled:opacity-50 ${comment.hasDisliked ? 'text-red-500' : ''}`}
              onClick={handleDislike}
              disabled={isTogglingDislike}
            >
              <ThumbsDown className={`size-3 ${comment.hasDisliked ? 'fill-current' : ''}`} />
              {comment.dislikeCount}
            </button>
          </div>
          <button
            className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => {
              setIsReplying(!isReplying);
              setReplyText("");
            }}
          >
            Reply
          </button>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border/40 bg-background/50 p-3 shadow-sm">
            <Textarea
              placeholder={`Reply to ${comment.author.name}...`}
              className="min-h-[80px] resize-y text-sm bg-background"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isAddingComment}
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                {isAddingComment ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Send className="size-3" />
                )}
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Replies */}
    {repliesByParent[comment.id] && repliesByParent[comment.id].length > 0 && (
      <div className={`space-y-1 border-l-2 border-border/40 ${!isNested ? 'ml-8 pl-4 mt-2 mb-2' : 'ml-4 pl-4 mt-1'}`}>
        {repliesByParent[comment.id].map((reply) => (
          <CommunityPostCommentItem 
            key={reply.id} 
            comment={reply}
            repliesByParent={repliesByParent}
            postId={postId}
            postAuthorName={postAuthorName}
            isNested={true}
          />
        ))}
      </div>
    )}
    </div>
  );
}
