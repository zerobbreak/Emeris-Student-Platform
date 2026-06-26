"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getCurrentUserAction } from "@/lib/actions/auth";
import { signOut } from "@/app/(auth)/login/actions";
import type { AuthUser } from "@/types/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<AuthUser | null> => getCurrentUserAction(),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return {
    mutate: async () => {
      queryClient.clear();
      await signOut();
      router.refresh();
    },
    isPending: false,
  };
}
