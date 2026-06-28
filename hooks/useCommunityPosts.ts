"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCommunityPostCommentAction,
  createCommunityPostAction,
  fetchCommunityPostAction,
  fetchCommunityPostCommentsAction,
  fetchCommunityPostsAction,
  uploadCommunityPostImageAction,
  toggleCommunityPostLikeAction,
  toggleCommunityPostDislikeAction,
  toggleCommunityPostCommentLikeAction,
  toggleCommunityPostCommentDislikeAction,
  fetchTrendingTopicsAction,
} from "@/lib/actions/community";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostComment, CommunityPostKind } from "@/types/communityPost";
import type { PopularTopic } from "@/lib/constants/communityFeed";

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

export function useToggleCommunityPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleCommunityPostLikeAction(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: communityPostsQueryKey("all") });
      await queryClient.cancelQueries({ queryKey: communityPostQueryKey(postId) });

      // Optimistically update the individual post
      const previousPost = queryClient.getQueryData<CommunityPost>(communityPostQueryKey(postId));
      if (previousPost) {
        queryClient.setQueryData<CommunityPost>(communityPostQueryKey(postId), {
          ...previousPost,
          hasLiked: !previousPost.hasLiked,
          likeCount: previousPost.hasLiked ? Math.max(0, previousPost.likeCount - 1) : previousPost.likeCount + 1,
        });
      }

      // Optimistically update the post in the lists
      const updateList = (kind: CommunityPostKind | "all") => {
        queryClient.setQueryData<CommunityPost[]>(communityPostsQueryKey(kind), (old) => {
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
      };

      updateList("all");
      updateList("assistance");
      updateList("project");
      updateList("tip");

      return { previousPost };
    },
    onError: (err, postId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(communityPostQueryKey(postId), context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: communityPostsQueryKey("all") });
    },
    onSettled: (data, err, postId) => {
      // Always refetch after error or success to ensure we have the correct server state
      queryClient.invalidateQueries({ queryKey: communityPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: communityPostsQueryKey("all") });
    },
  });
}

export function useToggleCommunityPostCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      toggleCommunityPostCommentLikeAction(commentId),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      await queryClient.cancelQueries({ queryKey: communityPostQueryKey(postId) });
      await queryClient.cancelQueries({ queryKey: communityPostCommentsQueryKey(postId) });
    },
    onSettled: (data, err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: communityPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: communityPostCommentsQueryKey(postId) });
    },
  });
}

export function useToggleCommunityPostDislike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleCommunityPostDislikeAction(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: communityPostsQueryKey("all") });
      await queryClient.cancelQueries({ queryKey: communityPostQueryKey(postId) });

      const previousPost = queryClient.getQueryData<CommunityPost>(communityPostQueryKey(postId));
      if (previousPost) {
        queryClient.setQueryData<CommunityPost>(communityPostQueryKey(postId), {
          ...previousPost,
          hasDisliked: !previousPost.hasDisliked,
          dislikeCount: previousPost.hasDisliked ? Math.max(0, (previousPost.dislikeCount ?? 0) - 1) : (previousPost.dislikeCount ?? 0) + 1,
        });
      }

      const updateList = (kind: CommunityPostKind | "all") => {
        queryClient.setQueryData<CommunityPost[]>(communityPostsQueryKey(kind), (old) => {
          if (!old) return old;
          return old.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                hasDisliked: !post.hasDisliked,
                dislikeCount: post.hasDisliked ? Math.max(0, (post.dislikeCount ?? 0) - 1) : (post.dislikeCount ?? 0) + 1,
              };
            }
            return post;
          });
        });
      };

      updateList("all");
      updateList("assistance");
      updateList("project");
      updateList("tip");

      return { previousPost };
    },
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(communityPostQueryKey(postId), context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: communityPostsQueryKey("all") });
    },
    onSettled: (data, err, postId) => {
      queryClient.invalidateQueries({ queryKey: communityPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: communityPostsQueryKey("all") });
    },
  });
}

export function useToggleCommunityPostCommentDislike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      toggleCommunityPostCommentDislikeAction(commentId),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      await queryClient.cancelQueries({ queryKey: communityPostQueryKey(postId) });
      await queryClient.cancelQueries({ queryKey: communityPostCommentsQueryKey(postId) });
    },
    onSettled: (data, err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: communityPostQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: communityPostCommentsQueryKey(postId) });
    },
  });
}

export function trendingTopicsQueryKey() {
  return ["trending-topics"] as const;
}

export function useTrendingTopics() {
  return useQuery({
    queryKey: trendingTopicsQueryKey(),
    queryFn: () => fetchTrendingTopicsAction(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
