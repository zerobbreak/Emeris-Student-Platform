"use client";

import { useRouter } from "next/navigation";

import { removeUserSkill, updateUserSkillStatus } from "@/app/actions/skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InferSelectModel } from "drizzle-orm";
import { BrainCircuit, BookOpen, GraduationCap, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddSkillDialog } from "@/components/platform/skills/add-skill-dialog";

// Define the expected types based on our schema
// It's a bit tricky without exporting the exact joined type, so we use generic object type with required fields.
type Skill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
};

type UserSkill = {
  id: string;
  userId: string;
  skillId: string;
  status: "to_learn" | "learning" | "mastered";
  endorsementCount: number;
  addedAt: Date;
  skill: Skill;
};

interface SkillsBoardProps {
  initialUserSkills: UserSkill[];
  allSkills: Skill[];
}

export function SkillsBoard({ initialUserSkills, allSkills }: SkillsBoardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (skillId: string, newStatus: "to_learn" | "learning" | "mastered") => {
    setIsUpdating(skillId);
    try {
      await updateUserSkillStatus(skillId, newStatus);
      toast.success("Skill status updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (skillId: string) => {
    if (!confirm("Are you sure you want to remove this skill from your board?")) return;
    setIsUpdating(skillId);
    try {
      await removeUserSkill(skillId);
      toast.success("Skill removed");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove skill");
    } finally {
      setIsUpdating(null);
    }
  };

  const toLearn = initialUserSkills.filter((s) => s.status === "to_learn");
  const learning = initialUserSkills.filter((s) => s.status === "learning");
  const mastered = initialUserSkills.filter((s) => s.status === "mastered");

  // Filter out skills the user already has from the add dialog options
  const userSkillIds = new Set(initialUserSkills.map((us) => us.skillId));
  const availableSkills = allSkills.filter((s) => !userSkillIds.has(s.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Board</h2>
        <AddSkillDialog availableSkills={availableSkills} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Learn Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-lg">To Learn</h3>
            <Badge variant="secondary" className="ml-auto">{toLearn.length}</Badge>
          </div>
          <div className="flex flex-col gap-3 min-h-[200px] p-2 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
            {toLearn.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No skills here yet.</p>
            )}
            {toLearn.map((userSkill) => (
              <SkillCard 
                key={userSkill.id} 
                userSkill={userSkill} 
                onStatusChange={handleStatusChange} 
                onRemove={handleRemove}
                isUpdating={isUpdating === userSkill.skillId}
              />
            ))}
          </div>
        </div>

        {/* Learning Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-lg">Learning</h3>
            <Badge variant="secondary" className="ml-auto">{learning.length}</Badge>
          </div>
          <div className="flex flex-col gap-3 min-h-[200px] p-2 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
            {learning.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No skills here yet.</p>
            )}
            {learning.map((userSkill) => (
              <SkillCard 
                key={userSkill.id} 
                userSkill={userSkill} 
                onStatusChange={handleStatusChange} 
                onRemove={handleRemove}
                isUpdating={isUpdating === userSkill.skillId}
              />
            ))}
          </div>
        </div>

        {/* Mastered Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <GraduationCap className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-lg">Mastered</h3>
            <Badge variant="secondary" className="ml-auto">{mastered.length}</Badge>
          </div>
          <div className="flex flex-col gap-3 min-h-[200px] p-2 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
            {mastered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No skills here yet.</p>
            )}
            {mastered.map((userSkill) => (
              <SkillCard 
                key={userSkill.id} 
                userSkill={userSkill} 
                onStatusChange={handleStatusChange} 
                onRemove={handleRemove}
                isUpdating={isUpdating === userSkill.skillId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ 
  userSkill, 
  onStatusChange, 
  onRemove,
  isUpdating 
}: { 
  userSkill: UserSkill; 
  onStatusChange: (id: string, status: "to_learn" | "learning" | "mastered") => void;
  onRemove: (id: string) => void;
  isUpdating: boolean;
}) {
  return (
    <Card className={`transition-opacity ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-base">{userSkill.skill.name}</CardTitle>
            <CardDescription className="text-xs mt-1">{userSkill.skill.category}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onRemove(userSkill.skillId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 py-2">
        {userSkill.skill.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {userSkill.skill.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Select 
          value={userSkill.status} 
          onValueChange={(val) => onStatusChange(userSkill.skillId, val as any)}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="to_learn">To Learn</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="mastered">Mastered</SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}
