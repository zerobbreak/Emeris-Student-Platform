"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addSkillAction,
  fetchProfileAction,
  removeSkillAction,
  updateProfileAction,
  uploadAvatarAction,
} from "@/lib/actions/profile";
import type { ProfileUpdateInput, PublicProfile } from "@/types/profile";

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfileAction(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateInput) => updateProfileAction(userId, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile", userId], updatedProfile);
    },
  });
}

export function useAddSkill(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { skillId?: string; skillName?: string }) =>
      addSkillAction(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useRemoveSkill(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => removeSkillAction(userId, skillId),
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
      return uploadAvatarAction(userId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}
