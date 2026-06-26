import type { HiveProjectStatus } from "@/lib/constants/hiveProjects";

export type CommunityPostKind = "project" | "assistance" | "tip";

export type CommunityPostFilter = "all" | CommunityPostKind;

export type CommunityProjectPost = {
  id: string;
  kind: CommunityPostKind;
  author: {
    name: string;
    course?: string;
    avatar?: string;
  };
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  reactions: number;
  comments: number;
  featured?: boolean;
  projectId?: string;
  projectTitle?: string;
  projectStatus?: HiveProjectStatus;
  technologies?: string[];
  assistanceArea?: string;
  tipFocus?: string;
};

export const communityProjectPosts: CommunityProjectPost[] = [
  {
    id: "cpp1",
    kind: "project",
    projectId: "hp1",
    projectTitle: "Campus Navigation PWA",
    projectStatus: "completed",
    technologies: ["React", "TypeScript", "PWA", "Mapbox"],
    author: { name: "Thandi Mokoena", course: "BCAD · Year 2" },
    title: "Listed: Campus Navigation PWA",
    excerpt:
      "Our team just published the full build — offline maps, lecture-hall search, and a Hive workspace finder. Feedback from first-years in week one was the best validation we could ask for.",
    tags: ["hive-projects", "react", "pwa"],
    publishedAt: "2026-06-23T09:00:00Z",
    reactions: 48,
    comments: 12,
    featured: true,
  },
  {
    id: "cpp2",
    kind: "assistance",
    projectId: "hp5",
    projectTitle: "Group Project Checklist Tool",
    projectStatus: "development",
    assistanceArea: "Firebase auth & role permissions",
    author: { name: "Aisha Khan", course: "HCERT · Year 2" },
    title: "Need help: role-based access in our checklist app",
    excerpt:
      "We have Kanban boards working but team leads can't restrict who edits sprint tasks. Anyone with experience wiring Firebase custom claims or a simpler RBAC pattern — would love a 20-min review.",
    tags: ["hive-projects", "firebase", "help-wanted"],
    publishedAt: "2026-06-23T07:30:00Z",
    reactions: 14,
    comments: 6,
  },
  {
    id: "cpp3",
    kind: "tip",
    tipFocus: "README & deployment links",
    author: { name: "Jordan Patel", course: "HCERT · Year 1" },
    title: "Tip: three README sections lecturers actually read",
    excerpt:
      "Problem statement, your role, and a working demo link above the fold. I moved ours to the top and got twice as many useful comments on the Hive Skills Dashboard review.",
    tags: ["portfolio", "hive-projects", "documentation"],
    publishedAt: "2026-06-22T15:45:00Z",
    reactions: 41,
    comments: 9,
    featured: true,
  },
  {
    id: "cpp4",
    kind: "project",
    projectId: "hp3",
    projectTitle: "Community Impact Prototype",
    projectStatus: "testing",
    technologies: ["Python", "FastAPI", "React", "Neon"],
    author: { name: "Lerato Nkosi", course: "HON · Year 3" },
    title: "Listed: Community Impact Prototype",
    excerpt:
      "NGO–student matching is in testing. We are looking for two more volunteer testers before the semester showcase — link in the project gallery.",
    tags: ["hive-projects", "community", "testing"],
    publishedAt: "2026-06-22T11:20:00Z",
    reactions: 56,
    comments: 18,
    featured: true,
  },
  {
    id: "cpp5",
    kind: "assistance",
    projectId: "hp6",
    projectTitle: "AgriSense Soil Monitor",
    projectStatus: "planning",
    assistanceArea: "MQTT broker setup",
    author: { name: "David Tshabalala", course: "HON · Year 3" },
    title: "Stuck on MQTT: sensor data not reaching Grafana",
    excerpt:
      "Arduino publishes to Mosquitto locally but our cloud dashboard stays empty. Suspect TLS or topic naming — happy to share our docker-compose if someone has done IoT pipelines before.",
    tags: ["iot", "help-wanted", "agriculture"],
    publishedAt: "2026-06-21T16:00:00Z",
    reactions: 22,
    comments: 11,
  },
  {
    id: "cpp6",
    kind: "tip",
    tipFocus: "Demo video",
    author: { name: "Samuel Okafor", course: "BCAD · Year 2" },
    title: "Tip: record a 90-second Loom before lecturer review",
    excerpt:
      "Walk through the happy path only — login, one key feature, outcome. Lecturers told us it cut review meetings in half and made written feedback more specific.",
    tags: ["portfolio", "career", "presentations"],
    publishedAt: "2026-06-21T10:15:00Z",
    reactions: 33,
    comments: 5,
  },
  {
    id: "cpp7",
    kind: "project",
    projectId: "hp2",
    projectTitle: "Hive Skills Dashboard",
    projectStatus: "development",
    technologies: ["Next.js", "Drizzle", "Recharts", "PostgreSQL"],
    author: { name: "Jordan Patel", course: "HCERT · Year 1" },
    title: "Listed: Hive Skills Dashboard (beta)",
    excerpt:
      "Cohort skill-gap charts are live for HCERT. BCAD and HON views ship next sprint — star the project if you want early access when we open the beta.",
    tags: ["hive-projects", "data-viz", "nextjs"],
    publishedAt: "2026-06-20T14:00:00Z",
    reactions: 41,
    comments: 8,
  },
  {
    id: "cpp8",
    kind: "assistance",
    projectId: "hp7",
    projectTitle: "Clinic Queue Optimiser",
    projectStatus: "idea",
    assistanceArea: "Queue simulation logic",
    author: { name: "Nomsa Dlamini", course: "BCAD · Year 2" },
    title: "Looking for a partner on discrete-event simulation",
    excerpt:
      "We have patient arrival data from the health centre but no one on the team has built a sim before. Open to pairing with someone who took the modelling module or has done Chart.js dashboards.",
    tags: ["help-wanted", "healthcare", "teamwork"],
    publishedAt: "2026-06-19T12:30:00Z",
    reactions: 14,
    comments: 4,
  },
  {
    id: "cpp9",
    kind: "tip",
    tipFocus: "Skills board entries",
    author: { name: "Thandi Mokoena", course: "BCAD · Year 2" },
    title: "Tip: tie each project skill to evidence, not buzzwords",
    excerpt:
      "Instead of listing 'React', I linked the component I owned and the PR that fixed state bugs. Endorsements came faster once skills pointed to real commits.",
    tags: ["skills", "portfolio", "hive-projects"],
    publishedAt: "2026-06-18T09:45:00Z",
    reactions: 28,
    comments: 7,
  },
  {
    id: "cpp10",
    kind: "project",
    projectId: "hp4",
    projectTitle: "Neon Study Notes API",
    projectStatus: "completed",
    technologies: ["Node.js", "Neon", "PostgreSQL", "OpenAPI"],
    author: { name: "Samuel Okafor", course: "BCAD · Year 2" },
    title: "Listed: Neon Study Notes API",
    excerpt:
      "Full-text search across module tags is done. OpenAPI docs are public — reuse the schema if your team is building study tools this term.",
    tags: ["hive-projects", "databases", "api"],
    publishedAt: "2026-06-17T17:00:00Z",
    reactions: 33,
    comments: 6,
  },
  {
    id: "cpp11",
    kind: "tip",
    tipFocus: "Pre-upload checklist",
    author: { name: "Aisha Khan", course: "HCERT · Year 2" },
    title: "Tip: run this checklist before you mark a project complete",
    excerpt:
      "Demo URL works on mobile, README credits every teammate, skills board updated, and one screenshot in landscape. Our cohort cut 'send fixes' emails by half.",
    tags: ["hive-projects", "checklist", "teamwork"],
    publishedAt: "2026-06-16T08:00:00Z",
    reactions: 19,
    comments: 3,
  },
];

export function sortCommunityProjectPosts(
  posts: CommunityProjectPost[],
  filter: CommunityPostFilter,
): CommunityProjectPost[] {
  const filtered =
    filter === "all"
      ? [...posts]
      : posts.filter((post) => post.kind === filter);

  return filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });
}
