"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  FolderKanban,
  Hash,
  Minus,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  popularTopics,
  trendingProjects,
  type TrendDirection,
} from "@/lib/constants/communityFeed";
import { cn } from "@/lib/utils";

type PlatformFeedPanelProps = {
  user: { id: string; name: string };
  profileImage?: string | null;
};

function TrendIndicator({
  trend,
  changePercent,
}: {
  trend: TrendDirection;
  changePercent: number;
}) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary">
        <ArrowUpRight className="size-3" />
        +{changePercent}%
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
        <ArrowDownRight className="size-3" />
        -{changePercent}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
      <Minus className="size-3" />
      {changePercent}%
    </span>
  );
}

function TopicRank({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums",
        rank <= 3
          ? "bg-secondary/20 text-secondary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {rank}
    </span>
  );
}

export function PlatformFeedPanel({ user: _user, profileImage: _profileImage }: PlatformFeedPanelProps) {
  return (
    <aside
      aria-label="Hive trends"
      className="flex h-full min-h-0 flex-col border-l bg-card"
    >
      <div className="shrink-0 border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-secondary" />
          <div>
            <h2 className="text-sm font-semibold">Hive Trends</h2>
            <p className="text-xs text-muted-foreground">
              Popular topics & projects this week
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-0 min-h-0 flex-1">
        <div className="space-y-4 p-4">
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold">
              <Hash className="size-3.5 text-primary" />
              Popular topics
            </CardTitle>
            <CardDescription className="text-[10px]">
              Most discussed tags across the Hive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {popularTopics.map((topic, index) => (
              <div key={topic.tag}>
                <div className="flex items-start gap-2.5">
                  <TopicRank rank={index + 1} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-medium">#{topic.tag}</p>
                      <TrendIndicator
                        trend={topic.trend}
                        changePercent={topic.changePercent}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {topic.mentions} mentions · {topic.posts} posts
                    </p>
                  </div>
                </div>
                {index < popularTopics.length - 1 && (
                  <Separator className="mt-2" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold">
              <FolderKanban className="size-3.5 text-secondary" />
              Popular projects
            </CardTitle>
            <CardDescription className="text-[10px]">
              Hive projects gaining the most attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {trendingProjects.map((project, index) => (
              <div key={project.id}>
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">
                      {project.title}
                    </p>
                    {project.trend === "up" && index < 3 && (
                      <Badge
                        variant="secondary"
                        className="h-4 shrink-0 border-0 bg-primary/10 px-1.5 text-[9px] text-primary"
                      >
                        Hot
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {project.author} · {project.course}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      {project.views} views · {project.reactions} reactions
                    </p>
                    <TrendIndicator
                      trend={project.trend}
                      changePercent={project.changePercent}
                    />
                  </div>
                </div>
                {index < trendingProjects.length - 1 && (
                  <Separator className="mt-2.5" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Link
          href="/community"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full border-primary/20 text-xs",
          )}
        >
          Explore community posts
        </Link>

        <p className="text-center text-[10px] text-muted-foreground">
          Live trend tracking ships with Hive Projects in Phase 2
        </p>
        </div>
      </ScrollArea>
    </aside>
  );
}
