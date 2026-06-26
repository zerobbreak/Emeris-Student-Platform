"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, apiClientFormData } from "@/lib/api-client";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedPost } from "@/types/feed";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => apiClient<FeedPost[]>("/api/v1/feed"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateFeedPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFeedPostInput) =>
      apiClient<FeedPost>("/api/v1/feed", {
        method: "POST",
        body: JSON.stringify(input),
      }),
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
      return apiClientFormData<{ imageUrl: string }>(
        "/api/v1/feed/image",
        formData,
      );
    },
  });
}
