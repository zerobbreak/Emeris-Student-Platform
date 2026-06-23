"use client";

import { type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryProvider>
  );
}
