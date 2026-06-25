"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { FeedPost } from "@/types/feed";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => apiClient<FeedPost[]>("/api/v1/feed"),
    staleTime: 1000 * 60 * 2,
  });
}
