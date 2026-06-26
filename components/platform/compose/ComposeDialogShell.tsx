"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { hiveWashFeed, hiveWashProject } from "./composeUtils";

type ComposeDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "feed" | "project";
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function ComposeDialogShell({
  open,
  onOpenChange,
  variant,
  badge,
  title,
  description,
  children,
  footer,
}: ComposeDialogShellProps) {
  const wash = variant === "project" ? hiveWashProject : hiveWashFeed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 ring-primary/10 sm:max-w-lg">
        <header
          className={cn(
            "relative shrink-0 overflow-hidden px-6 py-4 pr-14 text-primary-foreground",
            variant === "project" ? "bg-[#14463d]" : "bg-primary",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25 motion-safe:transition-opacity"
            style={wash}
          />
          <div className="relative space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "border-white/20 text-[11px] text-white hover:bg-white/15",
                  variant === "project"
                    ? "bg-secondary/90 text-secondary-foreground hover:bg-secondary/90"
                    : "bg-white/15",
                )}
              >
                {badge}
              </Badge>
              <DialogTitle className="font-heading text-base font-semibold tracking-tight text-white">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-white/80">
              {description}
            </DialogDescription>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card">
          <div className="space-y-4 px-6 py-5">{children}</div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/25 px-6 py-4 sm:flex-col">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
