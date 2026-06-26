"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { signUpWithEmail } from "@/app/(auth)/register/actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const [role, setRole] = useState<"student" | "lecturer">("student");

  return (
    <div className="w-full max-w-[400px]">
      {/* Mobile-only branding */}
      <div className="mb-8 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">HIVE Showcase</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          EMERIS student portfolio platform
        </p>
      </div>

      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Join the platform and start building your portfolio
        </p>
      </header>

      <form action={formAction}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="register-name">Full name</Label>
            <Input
              id="register-name"
              name="name"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="register-role">I am a</Label>
            <input type="hidden" name="role" value={role} />
            <Select
              value={role}
              onValueChange={(v) =>
                v && setRole(v as "student" | "lecturer")
              }
            >
              <SelectTrigger id="register-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
              </SelectContent>
            </Select>
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
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </div>
      </form>

      <Separator className="my-6" />

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
