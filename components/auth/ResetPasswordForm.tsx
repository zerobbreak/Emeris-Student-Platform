"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resetPassword } from "@/app/(auth)/reset-password/actions";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

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
          Create new password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please enter your new password below.
        </p>
      </header>

      <form action={formAction}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
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
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
