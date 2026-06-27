"use client";

import { useRouter } from "next/navigation";

import { addUserSkill } from "@/app/actions/skills";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Skill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
};

interface AddSkillDialogProps {
  availableSkills: Skill[];
}

export function AddSkillDialog({ availableSkills }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddSkill = async (skillId: string) => {
    setIsSubmitting(true);
    try {
      await addUserSkill(skillId);
      toast.success("Skill added to your board");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group skills by category for better UX
  const groupedSkills = availableSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="h-4 w-4" />
        Add Skill
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Skill</DialogTitle>
          <DialogDescription>
            Search and select a skill to add to your board.
          </DialogDescription>
        </DialogHeader>
        
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a skill or category..." disabled={isSubmitting} />
          <CommandList>
            <CommandEmpty>No skills found.</CommandEmpty>
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <CommandGroup key={category} heading={category}>
                {skills.map((skill) => (
                  <CommandItem
                    key={skill.id}
                    value={skill.name}
                    onSelect={() => handleAddSkill(skill.id)}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    <span>{skill.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
