"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAddSkill, useRemoveSkill } from "@/hooks/useProfile";
import type { ProfileSkill } from "@/types/profile";

interface SkillsSectionProps {
  userId: string;
  skills: ProfileSkill[];
  isOwner?: boolean;
}

export function SkillsSection({ userId, skills, isOwner }: SkillsSectionProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const addSkill = useAddSkill(userId);
  const removeSkill = useRemoveSkill(userId);

  const grouped = skills.reduce<Record<string, ProfileSkill[]>>((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  async function handleAdd(skillName: string) {
    try {
      await addSkill.mutateAsync({ skillName });
      toast.success(`Added ${skillName}`);
      setOpen(false);
      setSearch("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add skill");
    }
  }

  async function handleRemove(skillId: string) {
    try {
      await removeSkill.mutateAsync(skillId);
      toast.success("Skill removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove");
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills</h2>
        {isOwner && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
                <Plus className="size-4" />
                Add skill
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <Command>
                <CommandInput
                  placeholder="Search or create skill..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => search && handleAdd(search)}
                    >
                      Create &quot;{search}&quot;
                    </Button>
                  </CommandEmpty>
                  <CommandGroup>
                    {search && (
                      <CommandItem onSelect={() => handleAdd(search)}>
                        Add &quot;{search}&quot;
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="group gap-1 pr-1"
                  >
                    {skill.name}
                    {skill.endorsementCount > 0 && (
                      <span className="text-xs opacity-70">
                        ({skill.endorsementCount})
                      </span>
                    )}
                    {isOwner && (
                      <button
                        type="button"
                        className="ml-1 rounded-full p-0.5 opacity-0 transition hover:bg-background group-hover:opacity-100"
                        onClick={() => handleRemove(skill.id)}
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
