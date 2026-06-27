import Link from "next/link";
import { Mail } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type = searchParams.type;
  
  const title = type === "signup" ? "Check your email" : "Check your email";
  const description = type === "signup" 
    ? "We've sent you an email to verify your account. Please click the link in the email to complete your registration."
    : "If an account exists with that email, we've sent you a link to reset your password.";

  return (
    <div className="flex w-full max-w-[400px] flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="size-8 text-primary" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      
      <p className="mb-8 text-sm text-muted-foreground">
        {description}
      </p>

      <Link 
        href="/login" 
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Back to login
      </Link>
    </div>
  );
}
