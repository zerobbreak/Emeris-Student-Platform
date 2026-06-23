"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, apiClientFormData } from "@/lib/api-client";
import type { ProfileUpdateInput, PublicProfile } from "@/types/profile";

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () =>
      apiClient<PublicProfile>(
        `/api/v1/profiles/${userId}?include=skills,stats`,
      ),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateInput) =>
      apiClient<PublicProfile>(`/api/v1/profiles/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile", userId], updatedProfile);
    },
  });
}

export function useAddSkill(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { skillId?: string; skillName?: string }) =>
      apiClient(`/api/v1/profiles/${userId}/skills`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useRemoveSkill(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) =>
      apiClient(`/api/v1/profiles/${userId}/skills/${skillId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUploadAvatar(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClientFormData<{ profileImage: string }>(
        `/api/v1/profiles/${userId}/avatar`,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}
