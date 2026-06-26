"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { signInWithEmail } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div className="w-full max-w-[400px]">
      {/* Mobile-only branding (gradient panel is hidden on small screens) */}
      <div className="mb-8 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">HIVE Showcase</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          EMERIS student portfolio platform
        </p>
      </div>

      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </header>

      <form action={formAction}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {redirect && (
            <input type="hidden" name="redirect" value={redirect} />
          )}

          {state?.error && (
            <p className="text-[0.8125rem] text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>

      <Separator className="my-6" />

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
