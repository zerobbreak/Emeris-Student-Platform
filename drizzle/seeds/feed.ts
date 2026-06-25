export type SeedFeedUser = {
  email: string;
  name: string;
  course: string;
  year: number;
  bio: string;
};

export const seedFeedUsers: SeedFeedUser[] = [
  {
    email: "thandi.mokoena@student.emeris.ac.uk",
    name: "Thandi Mokoena",
    course: "BCAD",
    year: 2,
    bio: "BCAD Year 2 · portfolio and frontend focus",
  },
  {
    email: "jordan.patel@student.emeris.ac.uk",
    name: "Jordan Patel",
    course: "HCERT",
    year: 1,
    bio: "HCERT Year 1 · learning React and TypeScript",
  },
  {
    email: "lerato.nkosi@student.emeris.ac.uk",
    name: "Lerato Nkosi",
    course: "HON",
    year: 3,
    bio: "HON Year 3 · Hive sprint lead",
  },
  {
    email: "samuel.okafor@student.emeris.ac.uk",
    name: "Samuel Okafor",
    course: "BCAD",
    year: 2,
    bio: "BCAD Year 2 · databases and backend",
  },
  {
    email: "aisha.khan@student.emeris.ac.uk",
    name: "Aisha Khan",
    course: "HCERT",
    year: 2,
    bio: "HCERT Year 2 · group projects and documentation",
  },
];

export type SeedFeedPost = {
  authorEmail: string;
  text: string;
  imageUrl?: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  comments: {
    authorEmail: string;
    text: string;
    likeCount: number;
    dislikeCount: number;
    likedByCreator: boolean;
    createdAt: string;
  }[];
};

export const seedFeedPosts: SeedFeedPost[] = [
  {
    authorEmail: "thandi.mokoena@student.emeris.ac.uk",
    text: "Just restructured my portfolio for lecturer reviews — project ordering and skills board entries made a huge difference in week three feedback. Happy to share the template if anyone wants it.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    likeCount: 28,
    dislikeCount: 1,
    createdAt: "2026-06-22T09:15:00Z",
    comments: [
      {
        authorEmail: "jordan.patel@student.emeris.ac.uk",
        text: "This is really helpful — would love that template!",
        likeCount: 5,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-22T10:02:00Z",
      },
      {
        authorEmail: "aisha.khan@student.emeris.ac.uk",
        text: "Same approach worked for our cohort checklist.",
        likeCount: 3,
        dislikeCount: 0,
        likedByCreator: false,
        createdAt: "2026-06-22T11:30:00Z",
      },
    ],
  },
  {
    authorEmail: "jordan.patel@student.emeris.ac.uk",
    text: "React state patterns finally clicked for me after our dashboard assignment. Moving from useState soup to clearer component boundaries was the breakthrough.",
    likeCount: 41,
    dislikeCount: 2,
    createdAt: "2026-06-21T14:30:00Z",
    comments: [
      {
        authorEmail: "samuel.okafor@student.emeris.ac.uk",
        text: "Lifting state up + context for theme was our team's fix too.",
        likeCount: 8,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-21T15:10:00Z",
      },
      {
        authorEmail: "lerato.nkosi@student.emeris.ac.uk",
        text: "Consider TanStack Query for server state — game changer.",
        likeCount: 12,
        dislikeCount: 1,
        likedByCreator: false,
        createdAt: "2026-06-21T16:45:00Z",
      },
      {
        authorEmail: "thandi.mokoena@student.emeris.ac.uk",
        text: "We covered this in the skills workshop last week.",
        likeCount: 4,
        dislikeCount: 0,
        likedByCreator: false,
        createdAt: "2026-06-21T17:20:00Z",
      },
    ],
  },
  {
    authorEmail: "lerato.nkosi@student.emeris.ac.uk",
    text: "Our team shipped a community impact prototype in 48 hours during the Hive sprint. Biggest lesson: keep scope honest and present outcomes without over-selling the demo.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    likeCount: 56,
    dislikeCount: 0,
    createdAt: "2026-06-20T11:00:00Z",
    comments: [
      {
        authorEmail: "aisha.khan@student.emeris.ac.uk",
        text: "How did you split roles across the team?",
        likeCount: 6,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-20T12:15:00Z",
      },
      {
        authorEmail: "thandi.mokoena@student.emeris.ac.uk",
        text: "Inspiring work — the demo video was crisp.",
        likeCount: 9,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-20T13:00:00Z",
      },
    ],
  },
  {
    authorEmail: "samuel.okafor@student.emeris.ac.uk",
    text: "PostgreSQL basics every full-stack student should know: indexes, joins, and migrations — tied to what we're building on Neon this term. No jargon, just patterns that stick.",
    likeCount: 33,
    dislikeCount: 1,
    createdAt: "2026-06-19T16:45:00Z",
    comments: [
      {
        authorEmail: "jordan.patel@student.emeris.ac.uk",
        text: "The migration workflow section saved me hours.",
        likeCount: 7,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-19T17:30:00Z",
      },
    ],
  },
  {
    authorEmail: "aisha.khan@student.emeris.ac.uk",
    text: "Five questions to ask before you upload a group project: credit clarity, README quality, deployment links, and whether everyone's skills board is updated. Our cohort uses this checklist now.",
    likeCount: 19,
    dislikeCount: 0,
    createdAt: "2026-06-18T08:20:00Z",
    comments: [
      {
        authorEmail: "lerato.nkosi@student.emeris.ac.uk",
        text: "Adding this to our sprint retro template.",
        likeCount: 4,
        dislikeCount: 0,
        likedByCreator: true,
        createdAt: "2026-06-18T09:05:00Z",
      },
      {
        authorEmail: "samuel.okafor@student.emeris.ac.uk",
        text: "Deployment links are underrated — good call.",
        likeCount: 2,
        dislikeCount: 0,
        likedByCreator: false,
        createdAt: "2026-06-18T10:12:00Z",
      },
    ],
  },
];
