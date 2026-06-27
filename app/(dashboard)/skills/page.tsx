import { getAllSkills, getUserSkillsBoard } from "@/app/actions/skills";
import { SkillsBoard } from "@/components/platform/skills/skills-board";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills Board | Emeris Student Platform",
  description: "Track and work on your skills.",
};

export default async function SkillsPage() {
  const [userSkills, allSkills] = await Promise.all([
    getUserSkillsBoard(),
    getAllSkills(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Skills Board</h1>
        <p className="text-muted-foreground">
          Track the skills you want to learn, are currently learning, or have already mastered.
        </p>
      </div>

      <SkillsBoard initialUserSkills={userSkills} allSkills={allSkills} />
    </div>
  );
}
