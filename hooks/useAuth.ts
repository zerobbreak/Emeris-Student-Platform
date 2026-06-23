"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/types/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<AuthUser | null> => {
      const { data: session } = await authClient.getSession();
      if (!session?.user) return null;
      return apiClient<AuthUser>("/api/v1/auth/me");
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return {
    mutate: async () => {
      await authClient.signOut();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
    isPending: false,
  };
}
