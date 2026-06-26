"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFeedPostAction,
  fetchFeedAction,
  uploadFeedImageAction,
} from "@/lib/actions/feed";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedPost } from "@/types/feed";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => fetchFeedAction(),
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

export function useUploadFeedImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadFeedImageAction(formData);
    },
  });
}
