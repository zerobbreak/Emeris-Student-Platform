"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCommunityPostAction,
  fetchCommunityPostsAction,
  uploadCommunityPostImageAction,
} from "@/lib/actions/community";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostKind } from "@/types/communityPost";

export function communityPostsQueryKey(kind: CommunityPostKind | "all" = "all") {
  return ["community-posts", kind] as const;
}

export function useCommunityPosts(kind: CommunityPostKind | "all" = "all") {
  return useQuery({
    queryKey: communityPostsQueryKey(kind),
    queryFn: () => fetchCommunityPostsAction(kind),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommunityPostInput) =>
      createCommunityPostAction(input),
    onSuccess: (post) => {
      for (const kind of ["all", post.kind] as const) {
        queryClient.setQueryData<CommunityPost[]>(
          communityPostsQueryKey(kind),
          (current) => (current ? [post, ...current] : [post]),
        );
      }
    },
  });
}

export function useUploadCommunityPostImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadCommunityPostImageAction(formData);
    },
  });
}
