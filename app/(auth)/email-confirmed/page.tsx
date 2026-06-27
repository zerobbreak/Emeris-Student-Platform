import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EmailConfirmedPage() {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="size-8 text-primary" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Email verified
      </h1>
      
      <p className="mb-8 text-sm text-muted-foreground">
        Your email has been successfully verified and saved. You can now access your account.
      </p>

      <Link 
        href="/dashboard" 
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
