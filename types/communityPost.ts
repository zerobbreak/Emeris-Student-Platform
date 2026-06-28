import type { HiveProjectStatus } from "@/lib/constants/hiveProjects";

export type CommunityPostKind = "project" | "assistance" | "tip";

export type CommunityPostAuthor = {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
};

export type CommunityPostComment = {
  id: string;
  postId: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
  likedByCreator: boolean;
  replyToId: string | null;
  threadId: string | null;
  createdAt: string;
  author: CommunityPostAuthor;
};

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  tags: string[];
  imageUrl: string | null;
  projectId: string | null;
  projectTitle: string | null;
  projectStatus: HiveProjectStatus | null;
  technologies: string[] | null;
  assistanceArea: string | null;
  tipFocus: string | null;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  featured: boolean;
  createdAt: string;
  author: CommunityPostAuthor;
  comments?: CommunityPostComment[];
};
