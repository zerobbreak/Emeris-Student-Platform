import { Badge } from "@/components/ui/badge";
import type { ProfileStats } from "@/types/profile";

interface StatsBarProps {
  stats: ProfileStats;
}

const levelColors: Record<ProfileStats["currentLevel"], string> = {
  Beginner: "bg-muted text-muted-foreground",
  Explorer: "bg-accent/30 text-accent-foreground",
  Innovator: "bg-primary/20 text-primary",
  Expert: "bg-secondary/30 text-secondary-foreground",
  Master: "bg-secondary text-secondary-foreground",
};

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Projects", value: stats.projectCount },
    { label: "Certifications", value: stats.certCount },
    { label: "Points", value: stats.totalPoints.toLocaleString() },
  ];

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-2xl font-semibold">{item.value}</p>
          <p className="text-sm text-muted-foreground">{item.label}</p>
        </div>
      ))}
      <div className="text-center">
        <Badge className={levelColors[stats.currentLevel]}>
          {stats.currentLevel}
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">Level</p>
      </div>
    </div>
  );
}
