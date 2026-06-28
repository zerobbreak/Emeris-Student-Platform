"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Send } from "lucide-react";

import { PostCard } from "@/components/platform/CommunityProjectsFeed";
import { CommunityPostCommentItem } from "@/components/platform/CommunityPostComment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCommunityPost,
  useCommunityPostComments,
  useCreateCommunityPostComment,
} from "@/hooks/useCommunityPosts";
import { useCurrentUser } from "@/hooks/useAuth";

export default function CommunityPostDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const postId = params.id;

  const { data: user } = useCurrentUser();
  const { data: post, isLoading: isPostLoading } = useCommunityPost(postId);
  const { data: comments = [], isLoading: isCommentsLoading } = useCommunityPostComments(postId);
  const { mutate: addComment, isPending: isAddingComment } = useCreateCommunityPostComment();

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

  return (
    <div className="mx-auto max-w-3xl py-6 space-y-6">
      <div className="mb-4">
        <Link
          href="/community"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Back to Community
        </Link>
      </div>

      <PostCard post={post} />

      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

        {/* Comment Input */}
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

        {/* Comments List */}
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
  );
}
