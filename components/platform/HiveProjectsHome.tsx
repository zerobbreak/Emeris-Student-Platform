"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Eye,
  Flame,
  FolderKanban,
  Heart,
  Lightbulb,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlatformPageBody,
  PlatformPageHero,
} from "@/components/platform/PlatformPageHero";
import { IT_COURSES, type ItCourseCode } from "@/lib/constants/itCourses";
import {
  formatProjectDate,
  getTopHiveProjects,
  hiveProjects,
  impactCategoryLabels,
  sortHiveProjects,
  statusLabels,
  type HiveProject,
  type ImpactCategory,
  type ProjectSort,
} from "@/lib/constants/hiveProjects";
import {
  fieldMaterials,
  getMaterialsByIds,
  getMaterialsForCategories,
  materialTypeLabels,
  nicheImpactCategories,
  type FieldMaterial,
} from "@/lib/constants/hiveFieldMaterials";
import { useCurrentUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

type CourseFilter = ItCourseCode | "all";

const sortOptions: { id: ProjectSort; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "featured", label: "Featured" },
  { id: "latest", label: "Latest" },
];

const courseFilters: { id: CourseFilter; label: string }[] = [
  { id: "all", label: "All courses" },
  ...IT_COURSES.map((course) => ({
    id: course.code as CourseFilter,
    label: course.code,
  })),
];

function ProjectMaterials({
  project,
  compact = false,
}: {
  project: HiveProject;
  compact?: boolean;
}) {
  const materials = getMaterialsByIds(project.materialIds ?? []);
  if (materials.length === 0) return null;

  const isNiche = nicheImpactCategories.includes(project.impactCategory);

  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border border-dashed",
        isNiche
          ? "border-secondary/40 bg-secondary/5 px-3 py-2.5"
          : "border-primary/15 bg-primary/5 px-3 py-2.5",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <BookOpen className="size-3" />
        {isNiche ? "Field context" : "Related sources"}
      </div>
      <ul className={cn("space-y-2", compact && "space-y-1.5")}>
        {materials.slice(0, compact ? 2 : 4).map((material) => (
          <MaterialLink key={material.id} material={material} compact={compact} />
        ))}
      </ul>
      {compact && materials.length > 2 && (
        <p className="text-[10px] text-muted-foreground">
          +{materials.length - 2} more in field guides below
        </p>
      )}
    </div>
  );
}

function MaterialLink({
  material,
  compact = false,
}: {
  material: FieldMaterial;
  compact?: boolean;
}) {
  return (
    <li className="space-y-0.5">
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-start gap-1 text-xs font-medium text-primary hover:underline"
      >
        <span className={cn(compact && "line-clamp-1")}>{material.title}</span>
        <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-60 group-hover:opacity-100" />
      </a>
      {!compact && (
        <p className="text-[10px] leading-snug text-muted-foreground">
          <Lightbulb className="mr-0.5 inline size-3 text-secondary" />
          {material.outsiderNote}
        </p>
      )}
    </li>
  );
}

function FieldGuidesSection({
  categories,
}: {
  categories: ImpactCategory[];
}) {
  const [expandedCategory, setExpandedCategory] = useState<ImpactCategory | null>(
    categories.find((c) => nicheImpactCategories.includes(c)) ?? categories[0] ?? null,
  );

  const materialsByCategory = useMemo(() => {
    const materials = getMaterialsForCategories(categories);
    const grouped = new Map<ImpactCategory, FieldMaterial[]>();
    for (const material of materials) {
      const list = grouped.get(material.impactCategory) ?? [];
      list.push(material);
      grouped.set(material.impactCategory, list);
    }
    return grouped;
  }, [categories]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const aNiche = nicheImpactCategories.includes(a);
        const bNiche = nicheImpactCategories.includes(b);
        if (aNiche && !bNiche) return -1;
        if (!aNiche && bNiche) return 1;
        return impactCategoryLabels[a].localeCompare(impactCategoryLabels[b]);
      }),
    [categories],
  );

  if (sortedCategories.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Field guides & sources</h2>
        <p className="text-sm text-muted-foreground">
          Background reading for domains you might not study directly — agriculture,
          healthcare, informal finance, and more.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedCategories.map((category) => (
          <Button
            key={category}
            variant={expandedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setExpandedCategory(category)}
            className={cn(
              expandedCategory !== category &&
                "border-primary/15 hover:border-primary/30 hover:bg-primary/5",
            )}
          >
            {impactCategoryLabels[category]}
            {nicheImpactCategories.includes(category) && (
              <span className="ml-1 text-[10px] opacity-75">· niche</span>
            )}
          </Button>
        ))}
      </div>

      {expandedCategory && materialsByCategory.has(expandedCategory) && (
        <Card className="border-primary/15">
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Useful if you are reviewing{" "}
              <span className="font-medium text-foreground">
                {impactCategoryLabels[expandedCategory]}
              </span>{" "}
              projects without prior domain experience.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {(materialsByCategory.get(expandedCategory) ?? []).map(
                (material) => (
                  <li
                    key={material.id}
                    className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {materialTypeLabels[material.type]}
                      </Badge>
                    </div>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {material.title}
                      <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {material.description}
                    </p>
                    <p className="rounded-md bg-secondary/10 px-2 py-1.5 text-[11px] leading-snug text-foreground/80">
                      <Lightbulb className="mr-1 inline size-3 text-secondary" />
                      {material.outsiderNote}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function ProjectThumbnail({ project }: { project: HiveProject }) {
  return (
    <div
      className={cn(
        "relative flex h-28 items-end overflow-hidden rounded-lg bg-gradient-to-br sm:h-32",
        project.thumbnailGradient,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
      {project.featured && (
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 border-0 bg-white/20 text-[10px] text-white backdrop-blur-sm"
        >
          <Flame className="size-3" />
          Featured
        </Badge>
      )}
      <div className="relative w-full bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
          {impactCategoryLabels[project.impactCategory]}
        </p>
      </div>
    </div>
  );
}

function TopProjectCard({
  project,
  rank,
}: {
  project: HiveProject;
  rank: number;
}) {
  return (
    <Card className="overflow-hidden border-secondary/40 bg-secondary/5 transition hover:border-primary/25 hover:shadow-sm">
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums",
              rank === 1
                ? "bg-secondary/30 text-secondary-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            #{rank}
          </span>
          <Badge variant="outline" className="border-primary/20 text-[10px]">
            {project.course}
          </Badge>
        </div>
        <ProjectThumbnail project={project} />
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {project.title}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {project.description}
          </p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{project.leadName}</span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <Eye className="size-3" />
                {project.views}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Heart className="size-3" />
                {project.reactions}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: HiveProject }) {
  return (
    <Card className="overflow-hidden transition hover:border-primary/25 hover:shadow-sm">
      <CardContent className="space-y-4 pt-0">
        <ProjectThumbnail project={project} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/20 text-[10px]">
              {project.course}
            </Badge>
            <Badge
              variant="secondary"
              className="border-0 bg-primary/10 text-[10px] text-primary"
            >
              {statusLabels[project.status]}
            </Badge>
          </div>
          <h3 className="text-base font-semibold leading-snug hover:text-primary">
            {project.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="border-primary/15 bg-primary/5 text-[10px] text-primary"
            >
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge variant="outline" className="text-[10px]">
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>

        <ProjectMaterials project={project} compact />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {project.teamSize}
            </span>
            <span>{project.leadName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {project.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" />
              {project.reactions}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseSummaryCard({
  code,
  label,
  subtitle,
  count,
  isActive,
  onSelect,
}: {
  code: CourseFilter;
  label: string;
  subtitle?: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col rounded-xl border px-4 py-3 text-left transition",
        isActive
          ? "border-primary/30 bg-primary/10 ring-1 ring-primary/20"
          : "border-primary/10 hover:border-primary/25 hover:bg-primary/5",
      )}
    >
      <span className="text-lg font-semibold text-primary">{label}</span>
      <span className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
        {code === "all" ? "Every cohort" : (subtitle ?? label)}
      </span>
      <span className="mt-2 text-xs font-medium tabular-nums">
        {count} {count === 1 ? "project" : "projects"}
      </span>
    </button>
  );
}

export function HiveProjectsHome() {
  const [courseFilter, setCourseFilter] = useState<CourseFilter>("all");
  const [sort, setSort] = useState<ProjectSort>("top");
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile(user?.id ?? null);

  const topProjects = useMemo(() => getTopHiveProjects(3), []);

  const filteredProjects = useMemo(() => {
    const byCourse =
      courseFilter === "all"
        ? hiveProjects
        : hiveProjects.filter((project) => project.course === courseFilter);
    return sortHiveProjects(byCourse, sort);
  }, [courseFilter, sort]);

  const visibleFieldCategories = useMemo(() => {
    const fromProjects = [
      ...new Set(filteredProjects.map((p) => p.impactCategory)),
    ];
    if (fromProjects.length > 0) return fromProjects;
    return [...new Set(fieldMaterials.map((m) => m.impactCategory))];
  }, [filteredProjects]);

  const courseCounts = useMemo(() => {
    const counts: Record<CourseFilter, number> = {
      all: hiveProjects.length,
      BCAD: 0,
      HCERT: 0,
      HON: 0,
    };
    for (const project of hiveProjects) {
      counts[project.course] += 1;
    }
    return counts;
  }, []);

  const userCourse = profile?.course as ItCourseCode | undefined;
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <PlatformPageHero
        icon={FolderKanban}
        eyebrow="Hive Projects"
        title="Discover what the Hive is building"
        description={
          userCourse
            ? `Browse coursework and personal builds from EMERIS IT cohorts. Your course (${userCourse}) has ${courseCounts[userCourse]} listed projects.`
            : "Browse top coursework and personal builds from EMERIS IT cohorts. Filter by course to see work from your cohort."
        }
        stats={[
          { label: "Total", value: courseCounts.all },
          { label: "BCAD", value: courseCounts.BCAD },
          { label: "HCERT", value: courseCounts.HCERT },
          { label: "HON", value: courseCounts.HON },
        ]}
      />

      <PlatformPageBody className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              By course
            </h2>
            {userCourse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => setCourseFilter(userCourse)}
              >
                My course ({userCourse})
              </Button>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <CourseSummaryCard
              code="all"
              label="All"
              count={courseCounts.all}
              isActive={courseFilter === "all"}
              onSelect={() => setCourseFilter("all")}
            />
            {IT_COURSES.map((course) => (
              <CourseSummaryCard
                key={course.code}
                code={course.code}
                label={course.code}
                subtitle={course.label}
                count={courseCounts[course.code]}
                isActive={courseFilter === course.code}
                onSelect={() => setCourseFilter(course.code)}
              />
            ))}
          </div>
        </section>

        <FieldGuidesSection categories={visibleFieldCategories} />

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Top projects</h2>
              <p className="text-sm text-muted-foreground">
                Highest engagement across the Hive this month
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topProjects.map((project, index) => (
              <TopProjectCard
                key={project.id}
                project={project}
                rank={index + 1}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {courseFilter === "all"
                  ? "All Hive projects"
                  : `${courseFilter} projects`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"} ·
                Updated {formatProjectDate(filteredProjects[0]?.publishedAt ?? new Date().toISOString())}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={sort === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSort(option.id)}
                  className={cn(
                    sort !== option.id &&
                      "border-primary/15 hover:border-primary/30 hover:bg-primary/5",
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {courseFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={courseFilter === filter.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCourseFilter(filter.id)}
                className={cn(
                  courseFilter !== filter.id &&
                    "border-primary/15 hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects for this course yet. Check back after the next
                  Hive sprint, {firstName}.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </PlatformPageBody>
    </div>
  );
}
