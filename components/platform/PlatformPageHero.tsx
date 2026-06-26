import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const heroPattern = {
  backgroundImage:
    "radial-gradient(circle at 15% 85%, #7ec8a4 0%, transparent 50%), radial-gradient(circle at 85% 15%, #c6a45b 0%, transparent 45%)",
};

export type PlatformPageHeroStat = {
  label: string;
  value: string | number;
};

type PlatformPageHeroProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  stats?: PlatformPageHeroStat[];
  aside?: React.ReactNode;
  className?: string;
};

export function PlatformPageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  stats,
  aside,
  className,
}: PlatformPageHeroProps) {
  return (
    <section
      className={cn(
        "relative shrink-0 overflow-hidden bg-primary px-6 py-8 text-white sm:px-10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={heroPattern}
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Badge className="gap-1.5 border-white/20 bg-white/15 text-white hover:bg-white/15">
            <Icon className="size-3.5" aria-hidden />
            {eyebrow}
          </Badge>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              {description}
            </p>
          </div>
          {stats && stats.length > 0 && (
            <dl className="flex flex-wrap gap-2 pt-1">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-xs font-medium text-white">
                    <span className="text-white/70">{stat.label}</span>{" "}
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {aside ? <div className="shrink-0 lg:max-w-xs">{aside}</div> : null}
      </div>
    </section>
  );
}

export function PlatformPageBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5 p-6 pb-10", className)}>{children}</div>
  );
}
