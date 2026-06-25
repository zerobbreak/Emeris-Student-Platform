export type FeedFilter = "relevant" | "latest" | "top";

export type CommunityPost = {
  id: string;
  author: {
    name: string;
    avatar?: string;
    course?: string;
  };
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  reactions: number;
  comments: number;
  featured?: boolean;
};

export const communityTags = [
  { label: "#react", count: 42 },
  { label: "#portfolio", count: 38 },
  { label: "#hive-projects", count: 31 },
  { label: "#career", count: 27 },
  { label: "#typescript", count: 24 },
  { label: "#design", count: 19 },
  { label: "#databases", count: 16 },
  { label: "#teamwork", count: 14 },
] as const;

export type TrendDirection = "up" | "down" | "steady";

export type PopularTopic = {
  tag: string;
  mentions: number;
  posts: number;
  trend: TrendDirection;
  changePercent: number;
};

export type TrendingProject = {
  id: string;
  title: string;
  author: string;
  course: string;
  views: number;
  reactions: number;
  trend: TrendDirection;
  changePercent: number;
};

export const popularTopics: PopularTopic[] = [
  { tag: "react", mentions: 42, posts: 18, trend: "up", changePercent: 12 },
  { tag: "portfolio", mentions: 38, posts: 15, trend: "up", changePercent: 8 },
  { tag: "hive-projects", mentions: 31, posts: 12, trend: "up", changePercent: 22 },
  { tag: "career", mentions: 27, posts: 11, trend: "steady", changePercent: 2 },
  { tag: "typescript", mentions: 24, posts: 9, trend: "up", changePercent: 15 },
  { tag: "design", mentions: 19, posts: 7, trend: "down", changePercent: 3 },
];

export const trendingProjects: TrendingProject[] = [
  {
    id: "p1",
    title: "Campus Navigation PWA",
    author: "Thandi M.",
    course: "BCAD",
    views: 124,
    reactions: 48,
    trend: "up",
    changePercent: 24,
  },
  {
    id: "p2",
    title: "Hive Skills Dashboard",
    author: "Jordan P.",
    course: "HCERT",
    views: 98,
    reactions: 41,
    trend: "up",
    changePercent: 18,
  },
  {
    id: "p3",
    title: "Community Impact Prototype",
    author: "Lerato N.",
    course: "HON",
    views: 156,
    reactions: 56,
    trend: "up",
    changePercent: 31,
  },
  {
    id: "p4",
    title: "Neon Study Notes API",
    author: "Samuel O.",
    course: "BCAD",
    views: 72,
    reactions: 33,
    trend: "steady",
    changePercent: 4,
  },
  {
    id: "p5",
    title: "Group Project Checklist Tool",
    author: "Aisha K.",
    course: "HCERT",
    views: 61,
    reactions: 19,
    trend: "down",
    changePercent: 2,
  },
];

export const trendingTopics = [
  { title: "Showcasing your first Hive project", posts: 12 },
  { title: "Portfolio tips for BCAD students", posts: 9 },
  { title: "Preparing for industry placements", posts: 7 },
  { title: "Git workflow for group coursework", posts: 6 },
] as const;

export const communityPosts: CommunityPost[] = [
  {
    id: "1",
    author: {
      name: "Thandi Mokoena",
      course: "BCAD · Year 2",
    },
    title: "How I structured my portfolio for lecturer reviews",
    excerpt:
      "A practical breakdown of sections, project ordering, and the skills board entries that helped me get meaningful feedback in week three.",
    tags: ["portfolio", "career", "hive-projects"],
    publishedAt: "2026-06-22T09:15:00Z",
    readMinutes: 4,
    reactions: 28,
    comments: 7,
    featured: true,
  },
  {
    id: "2",
    author: {
      name: "Jordan Patel",
      course: "HCERT · Year 1",
    },
    title: "React state patterns that finally clicked for me",
    excerpt:
      "Moving from useState soup to clearer component boundaries — with examples from our semester dashboard assignment.",
    tags: ["react", "typescript"],
    publishedAt: "2026-06-21T14:30:00Z",
    readMinutes: 6,
    reactions: 41,
    comments: 11,
  },
  {
    id: "3",
    author: {
      name: "Lerato Nkosi",
      course: "HON · Year 3",
    },
    title: "Our team shipped a community impact prototype in 48 hours",
    excerpt:
      "Lessons from a Hive sprint: splitting roles, keeping scope honest, and presenting outcomes without over-selling the demo.",
    tags: ["hive-projects", "teamwork", "design"],
    publishedAt: "2026-06-20T11:00:00Z",
    readMinutes: 5,
    reactions: 56,
    comments: 14,
    featured: true,
  },
  {
    id: "4",
    author: {
      name: "Samuel Okafor",
      course: "BCAD · Year 2",
    },
    title: "PostgreSQL basics every full-stack student should know",
    excerpt:
      "Indexes, joins, and migrations explained without the jargon — tied to what we are building on Neon this term.",
    tags: ["databases", "career"],
    publishedAt: "2026-06-19T16:45:00Z",
    readMinutes: 8,
    reactions: 33,
    comments: 9,
  },
  {
    id: "5",
    author: {
      name: "Aisha Khan",
      course: "HCERT · Year 2",
    },
    title: "Five questions to ask before you upload a group project",
    excerpt:
      "Credit, README quality, and deployment links matter. Here is the checklist our cohort uses before publishing to the Hive gallery.",
    tags: ["hive-projects", "portfolio"],
    publishedAt: "2026-06-18T08:20:00Z",
    readMinutes: 3,
    reactions: 19,
    comments: 4,
  },
];

export function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
