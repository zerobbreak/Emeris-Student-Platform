import { Metadata } from "next";
import { ResourcesBoard } from "@/components/platform/resources/resources-board";
import { getAllResources } from "@/app/actions/resources";

export const metadata: Metadata = {
  title: "Resources | Emeris Student Platform",
  description: "Discover resources to help you develop your skills.",
};

export default async function ResourcesPage() {
  const initialResources = await getAllResources();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Discover tutorials, articles, and courses to help you master new skills.
        </p>
      </div>

      <ResourcesBoard initialResources={initialResources} />
    </div>
  );
}
