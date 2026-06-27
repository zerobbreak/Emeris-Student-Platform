"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { requestPasswordReset } from "@/app/(auth)/forgot-password/actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">HIVE Showcase</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          EMERIS student portfolio platform
        </p>
      </div>

      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </header>

      <form action={formAction}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              required
            />
          </div>

          {state?.error && (
            <p className="text-[0.8125rem] text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send reset link"}
          </Button>
        </div>
      </form>

      <Separator className="my-6" />

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
