import type { ItCourseCode } from "@/lib/constants/itCourses";

export type HiveProjectStatus =
  | "idea"
  | "planning"
  | "development"
  | "testing"
  | "completed";

export type ImpactCategory =
  | "education"
  | "healthcare"
  | "community"
  | "finance"
  | "agriculture"
  | "environment";

export type ProjectSort = "top" | "latest" | "featured";

export type HiveProject = {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  status: HiveProjectStatus;
  impactCategory: ImpactCategory;
  course: ItCourseCode;
  technologies: string[];
  teamSize: number;
  leadName: string;
  views: number;
  reactions: number;
  featured: boolean;
  publishedAt: string;
  thumbnailGradient: string;
  /** Curated field materials — especially for domains outside typical IT coursework */
  materialIds?: string[];
};

export const impactCategoryLabels: Record<ImpactCategory, string> = {
  education: "Education",
  healthcare: "Healthcare",
  community: "Community",
  finance: "Finance",
  agriculture: "Agriculture",
  environment: "Environment",
};

export const statusLabels: Record<HiveProjectStatus, string> = {
  idea: "Idea",
  planning: "Planning",
  development: "In development",
  testing: "Testing",
  completed: "Completed",
};

export const hiveProjects: HiveProject[] = [
  {
    id: "hp1",
    title: "Campus Navigation PWA",
    description:
      "A progressive web app helping new students find lecture halls, labs, and Hive workspaces across the EMERIS campus.",
    problemStatement:
      "First-year students struggle to locate rooms during the first weeks of term.",
    status: "completed",
    impactCategory: "education",
    course: "BCAD",
    technologies: ["React", "TypeScript", "PWA", "Mapbox"],
    teamSize: 4,
    leadName: "Thandi M.",
    views: 124,
    reactions: 48,
    featured: true,
    publishedAt: "2026-06-10T10:00:00Z",
    thumbnailGradient: "from-primary/80 to-accent/60",
    materialIds: ["edu-pwa"],
  },
  {
    id: "hp2",
    title: "Hive Skills Dashboard",
    description:
      "Visualises cohort skill gaps and project contributions so lecturers can spot mentoring opportunities early.",
    problemStatement:
      "Skills data is scattered across portfolios and never aggregated at cohort level.",
    status: "development",
    impactCategory: "education",
    course: "HCERT",
    technologies: ["Next.js", "Drizzle", "Recharts", "PostgreSQL"],
    teamSize: 3,
    leadName: "Jordan P.",
    views: 98,
    reactions: 41,
    featured: true,
    publishedAt: "2026-06-08T14:30:00Z",
    thumbnailGradient: "from-secondary/70 to-primary/50",
  },
  {
    id: "hp3",
    title: "Community Impact Prototype",
    description:
      "Connects local NGOs with student volunteers for short-term digital support sprints during semester breaks.",
    problemStatement:
      "Community organisations lack affordable tech help; students need real briefs for portfolios.",
    status: "testing",
    impactCategory: "community",
    course: "HON",
    technologies: ["Python", "FastAPI", "React", "Neon"],
    teamSize: 5,
    leadName: "Lerato N.",
    views: 156,
    reactions: 56,
    featured: true,
    publishedAt: "2026-06-05T09:15:00Z",
    thumbnailGradient: "from-primary to-accent-foreground",
    materialIds: ["com-ngo-brief", "com-impact", "com-volunteer"],
  },
  {
    id: "hp4",
    title: "Neon Study Notes API",
    description:
      "Shared revision notes API with full-text search, tagged by module code and synced across study groups.",
    problemStatement:
      "Study groups duplicate notes in chat apps with no search or version history.",
    status: "completed",
    impactCategory: "education",
    course: "BCAD",
    technologies: ["Node.js", "Neon", "PostgreSQL", "OpenAPI"],
    teamSize: 2,
    leadName: "Samuel O.",
    views: 72,
    reactions: 33,
    featured: false,
    publishedAt: "2026-06-01T16:45:00Z",
    thumbnailGradient: "from-accent/70 to-primary/30",
    materialIds: ["edu-fts"],
  },
  {
    id: "hp5",
    title: "Group Project Checklist Tool",
    description:
      "Kanban-style task board with role assignments and README templates for Hive coursework teams.",
    problemStatement:
      "Group projects stall when responsibilities are unclear before the first sprint.",
    status: "development",
    impactCategory: "education",
    course: "HCERT",
    technologies: ["Vue", "Firebase", "Tailwind"],
    teamSize: 3,
    leadName: "Aisha K.",
    views: 61,
    reactions: 19,
    featured: false,
    publishedAt: "2026-05-28T11:20:00Z",
    thumbnailGradient: "from-secondary/60 to-accent/40",
  },
  {
    id: "hp6",
    title: "AgriSense Soil Monitor",
    description:
      "IoT dashboard for smallholder farms tracking moisture and pH with SMS alerts in local languages.",
    problemStatement:
      "Rural farmers lack affordable real-time soil data to optimise planting windows.",
    status: "planning",
    impactCategory: "agriculture",
    course: "HON",
    technologies: ["Arduino", "Python", "MQTT", "Grafana"],
    teamSize: 4,
    leadName: "David T.",
    views: 45,
    reactions: 22,
    featured: false,
    publishedAt: "2026-05-25T08:00:00Z",
    thumbnailGradient: "from-primary/60 to-accent/40",
    materialIds: ["ag-soil-basics", "ag-mqtt-iot", "ag-extension"],
  },
  {
    id: "hp7",
    title: "Clinic Queue Optimiser",
    description:
      "Patient flow simulation for campus health centres to reduce wait times during peak flu season.",
    problemStatement:
      "Walk-in queues spike unpredictably, frustrating students and staff.",
    status: "idea",
    impactCategory: "healthcare",
    course: "BCAD",
    technologies: ["React", "Simulation", "Chart.js"],
    teamSize: 2,
    leadName: "Nomsa D.",
    views: 38,
    reactions: 14,
    featured: false,
    publishedAt: "2026-05-20T13:00:00Z",
    thumbnailGradient: "from-accent-foreground to-primary/70",
    materialIds: ["hc-queueing", "hc-triage", "hc-privacy"],
  },
  {
    id: "hp8",
    title: "Micro-Finance Ledger",
    description:
      "Lightweight ledger for stokvel groups with transparent contribution tracking and payout schedules.",
    problemStatement:
      "Informal savings groups rely on paper records prone to disputes.",
    status: "testing",
    impactCategory: "finance",
    course: "HCERT",
    technologies: ["React Native", "SQLite", "Expo"],
    teamSize: 3,
    leadName: "Chris M.",
    views: 52,
    reactions: 27,
    featured: false,
    publishedAt: "2026-05-15T10:30:00Z",
    thumbnailGradient: "from-secondary/50 to-primary/40",
    materialIds: ["fin-stokvel", "fin-informal", "fin-mobile-money"],
  },
];

export function sortHiveProjects(
  projects: HiveProject[],
  sort: ProjectSort,
): HiveProject[] {
  const copy = [...projects];

  switch (sort) {
    case "latest":
      return copy.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );
    case "featured":
      return copy.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.reactions - a.reactions;
      });
    default:
      return copy.sort((a, b) => b.reactions + b.views - (a.reactions + a.views));
  }
}

export function getTopHiveProjects(limit = 3): HiveProject[] {
  return sortHiveProjects(hiveProjects, "top").slice(0, limit);
}

export function getProjectsByCourse(
  course: ItCourseCode | "all",
): HiveProject[] {
  if (course === "all") return hiveProjects;
  return hiveProjects.filter((project) => project.course === course);
}

export function formatProjectDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
