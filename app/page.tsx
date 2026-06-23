import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-primary">HIVE Showcase</h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        The EMERIS student portfolio platform. Showcase your projects, build your
        skills profile, and earn recognition.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
          Get started
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
