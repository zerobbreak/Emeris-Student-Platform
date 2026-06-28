"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addFeedPostCommentAction,
  createFeedPostAction,
  fetchFeedAction,
  fetchFeedPostAction,
  uploadFeedImageAction,
  toggleFeedPostLikeAction,
} from "@/lib/actions/feed";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedComment, FeedPost } from "@/types/feed";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => fetchFeedAction(),
    staleTime: 1000 * 60 * 2,
  });
}

export function feedPostQueryKey(id: string) {
  return ["feed-post", id] as const;
}

export function useFeedPost(id: string) {
  return useQuery({
    queryKey: feedPostQueryKey(id),
    queryFn: () => fetchFeedPostAction(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateFeedPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFeedPostInput) => createFeedPostAction(input),
    onSuccess: (post) => {
      queryClient.setQueryData<FeedPost[]>(["feed"], (current) =>
        current ? [post, ...current] : [post],
      );
    },
  });
}

export function useCreateFeedPostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      text,
      replyToId,
      threadId,
    }: {
      postId: string;
      text: string;
      replyToId?: string | null;
      threadId?: string | null;
    }) => addFeedPostCommentAction(postId, text, replyToId, threadId),
    onSuccess: (comment, { postId }) => {
      // Invalidate the specific post so it fetches the new comment and updated commentCount
      queryClient.invalidateQueries({ queryKey: feedPostQueryKey(postId) });
      // Also invalidate the main feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUploadFeedImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadFeedImageAction(formData);
    },
  });
}

export function useToggleFeedPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleFeedPostLikeAction(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: feedPostQueryKey(postId) });

      const previousPost = queryClient.getQueryData<FeedPost>(feedPostQueryKey(postId));
      if (previousPost) {
        queryClient.setQueryData<FeedPost>(feedPostQueryKey(postId), {
          ...previousPost,
          hasLiked: !previousPost.hasLiked,
          likeCount: previousPost.hasLiked ? Math.max(0, previousPost.likeCount - 1) : previousPost.likeCount + 1,
        });
      }

      queryClient.setQueryData<FeedPost[]>(["feed"], (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              hasLiked: !post.hasLiked,
              likeCount: post.hasLiked ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
            };
          }
          return post;
        });
      });

      return { previousPost };
    },
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(feedPostQueryKey(postId), context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onSettled: (data, err, postId) => {
      queryClient.invalidateQueries({ queryKey: feedPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
