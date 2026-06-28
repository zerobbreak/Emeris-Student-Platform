"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCommunityPostCommentAction,
  createCommunityPostAction,
  fetchCommunityPostAction,
  fetchCommunityPostCommentsAction,
  fetchCommunityPostsAction,
  uploadCommunityPostImageAction,
} from "@/lib/actions/community";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostComment, CommunityPostKind } from "@/types/communityPost";

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

export function communityPostQueryKey(id: string) {
  return ["community-post", id] as const;
}

export function useCommunityPost(id: string) {
  return useQuery({
    queryKey: communityPostQueryKey(id),
    queryFn: () => fetchCommunityPostAction(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function communityPostCommentsQueryKey(postId: string) {
  return ["community-post-comments", postId] as const;
}

export function useCommunityPostComments(postId: string) {
  return useQuery({
    queryKey: communityPostCommentsQueryKey(postId),
    queryFn: () => fetchCommunityPostCommentsAction(postId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCommunityPostComment() {
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
    }) => addCommunityPostCommentAction(postId, text, replyToId, threadId),
    onSuccess: (comment, { postId }) => {
      // Update comments list
      queryClient.setQueryData<CommunityPostComment[]>(
        communityPostCommentsQueryKey(postId),
        (current) => (current ? [comment, ...current] : [comment]),
      );
      
      // Also invalidate the post so commentCount updates
      queryClient.invalidateQueries({ queryKey: communityPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: communityPostsQueryKey("all") });
    },
  });
}
