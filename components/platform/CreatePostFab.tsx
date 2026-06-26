"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FolderKanban, PenLine, Plus, X } from "lucide-react";

import { CreatePostDialog } from "@/components/platform/CreatePostDialog";
import { CreateProjectPostDialog } from "@/components/platform/CreateProjectPostDialog";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const createRoutes = ["/dashboard", "/community"] as const;

const feedPlaceholders: Record<(typeof createRoutes)[number], string> = {
  "/dashboard": "Share an update, tip, or question with the Hive...",
  "/community": "Share a quick update with the community...",
};

export function CreatePostFab() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile(user?.id ?? null);

  const route = createRoutes.find((item) => pathname === item);

  if (!route || !user) {
    return null;
  }

  function openPostDialog() {
    setMenuOpen(false);
    setPostOpen(true);
  }

  function openProjectDialog() {
    setMenuOpen(false);
    setProjectOpen(true);
  }

  return (
    <>
      <div className="pointer-events-none absolute right-6 bottom-6 z-20 flex flex-col items-end gap-3">
        {menuOpen ? (
          <div className="pointer-events-auto flex flex-col items-stretch gap-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={openProjectDialog}
              className="h-10 justify-start gap-2 rounded-full border-0 bg-card px-4 shadow-lg ring-1 ring-border/60"
            >
              <FolderKanban className="size-4 text-primary" />
              Project post
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={openPostDialog}
              className="h-10 justify-start gap-2 rounded-full px-4 shadow-lg"
            >
              <PenLine className="size-4" />
              Feed post
            </Button>
          </div>
        ) : null}

        <Button
          type="button"
          size="icon-lg"
          aria-label={menuOpen ? "Close create menu" : "Create"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className={cn(
            "pointer-events-auto size-14 rounded-full shadow-lg shadow-primary/25",
            "ring-4 ring-background transition-transform hover:scale-105",
            menuOpen && "rotate-45",
          )}
        >
          {menuOpen ? <X className="size-5" /> : <Plus className="size-5" />}
        </Button>
      </div>

      <CreatePostDialog
        open={postOpen}
        onOpenChange={setPostOpen}
        user={user}
        profile={profile}
        placeholder={feedPlaceholders[route]}
      />

      <CreateProjectPostDialog
        open={projectOpen}
        onOpenChange={setProjectOpen}
        user={user}
        profile={profile}
      />
    </>
  );
}
