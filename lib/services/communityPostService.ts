import { put } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { communityPosts } from "@/lib/db/schema";
import type { CreateCommunityPostInput } from "@/lib/validators/communityPostValidator";
import type { CommunityPost, CommunityPostKind } from "@/types/communityPost";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class CommunityPostError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CommunityPostError";
  }
}

function mapAuthor(user: {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
}) {
  return {
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
    course: user.course,
    year: user.year,
  };
}

function mapCommunityPost(row: {
  id: string;
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  tags: string[];
  imageUrl: string | null;
  projectId: string | null;
  projectTitle: string | null;
  projectStatus: CommunityPost["projectStatus"];
  technologies: string[] | null;
  assistanceArea: string | null;
  tipFocus: string | null;
  likeCount: number;
  commentCount: number;
  featured: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    profileImage: string | null;
    course: string | null;
    year: number | null;
  };
}): CommunityPost {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    excerpt: row.excerpt,
    tags: row.tags,
    imageUrl: row.imageUrl,
    projectId: row.projectId,
    projectTitle: row.projectTitle,
    projectStatus: row.projectStatus,
    technologies: row.technologies,
    assistanceArea: row.assistanceArea,
    tipFocus: row.tipFocus,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
  };
}

export async function getCommunityPosts(
  kind?: CommunityPostKind | "all",
): Promise<CommunityPost[]> {
  const rows = await db.query.communityPosts.findMany({
    where:
      kind && kind !== "all"
        ? eq(communityPosts.kind, kind)
        : undefined,
    orderBy: [desc(communityPosts.createdAt)],
    with: { author: true },
  });

  return rows.map(mapCommunityPost);
}

export async function createCommunityPost(
  authorId: string,
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  const imageUrl = input.imageUrl?.trim() || null;
  const projectId = input.projectId?.trim() || null;
  const sharedProjectTitle =
    input.kind === "project"
      ? input.projectTitle.trim()
      : input.projectTitle?.trim() || null;

  const [inserted] = await db
    .insert(communityPosts)
    .values({
      authorId,
      kind: input.kind,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      tags: input.tags,
      imageUrl,
      projectId,
      projectTitle: sharedProjectTitle,
      projectStatus: input.kind === "project" ? input.projectStatus : null,
      technologies: input.kind === "project" ? input.technologies : null,
      assistanceArea: input.kind === "assistance" ? input.assistanceArea : null,
      tipFocus: input.kind === "tip" ? input.tipFocus : null,
    })
    .returning({ id: communityPosts.id });

  const row = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, inserted.id),
    with: { author: true },
  });

  if (!row) {
    throw new CommunityPostError("INTERNAL_ERROR", "Failed to load created post");
  }

  return mapCommunityPost(row);
}

export async function uploadCommunityPostImage(userId: string, file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new CommunityPostError(
      "VALIDATION_ERROR",
      "Unsupported file format. Use JPEG, PNG, or WebP",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new CommunityPostError("VALIDATION_ERROR", "File too large. Max 5MB");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new CommunityPostError(
      "SERVICE_UNAVAILABLE",
      "Image upload is not configured",
    );
  }

  const blob = await put(
    `community-post-images/${userId}/${file.name}`,
    file,
    {
      access: "public",
      addRandomSuffix: true,
    },
  );

  return { imageUrl: blob.url };
}
