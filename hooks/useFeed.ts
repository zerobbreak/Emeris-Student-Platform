"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addFeedPostCommentAction,
  createFeedPostAction,
  fetchFeedAction,
  fetchFeedPostAction,
  uploadFeedImageAction,
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
