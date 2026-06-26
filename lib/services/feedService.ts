import { put } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feedPosts } from "@/lib/db/schema";
import type { CreateFeedPostInput } from "@/lib/validators/feedValidator";
import type { FeedAuthor, FeedComment, FeedPost } from "@/types/feed";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class FeedError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FeedError";
  }
}

function mapAuthor(user: {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
}): FeedAuthor {
  return {
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
    course: user.course,
    year: user.year,
  };
}

function mapFeedPost(row: {
  id: string;
  text: string;
  imageUrl: string | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    profileImage: string | null;
    course: string | null;
    year: number | null;
  };
  comments: Array<{
    id: string;
    postId: string;
    text: string;
    likeCount: number;
    dislikeCount: number;
    likedByCreator: boolean;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      profileImage: string | null;
      course: string | null;
      year: number | null;
    };
  }>;
}): FeedPost {
  return {
    id: row.id,
    text: row.text,
    imageUrl: row.imageUrl,
    likeCount: row.likeCount,
    dislikeCount: row.dislikeCount,
    commentCount: row.commentCount,
    createdAt: row.createdAt.toISOString(),
    author: mapAuthor(row.author),
    comments: row.comments.map(
      (comment): FeedComment => ({
        id: comment.id,
        postId: comment.postId,
        text: comment.text,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        likedByCreator: comment.likedByCreator,
        createdAt: comment.createdAt.toISOString(),
        author: mapAuthor(comment.author),
      }),
    ),
  };
}

export async function getFeedPosts(): Promise<FeedPost[]> {
  const rows = await db.query.feedPosts.findMany({
    orderBy: [desc(feedPosts.createdAt)],
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  return rows.map(mapFeedPost);
}

export async function createFeedPost(
  authorId: string,
  input: CreateFeedPostInput,
): Promise<FeedPost> {
  const imageUrl = input.imageUrl?.trim() || null;

  const [inserted] = await db
    .insert(feedPosts)
    .values({
      authorId,
      text: input.text.trim(),
      imageUrl,
    })
    .returning({ id: feedPosts.id });

  const row = await db.query.feedPosts.findFirst({
    where: eq(feedPosts.id, inserted.id),
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!row) {
    throw new FeedError("INTERNAL_ERROR", "Failed to load created post");
  }

  return mapFeedPost(row);
}

export async function uploadFeedImage(userId: string, file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FeedError(
      "VALIDATION_ERROR",
      "Unsupported file format. Use JPEG, PNG, or WebP",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new FeedError("VALIDATION_ERROR", "File too large. Max 5MB");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new FeedError(
      "SERVICE_UNAVAILABLE",
      "Image upload is not configured",
    );
  }

  const blob = await put(`feed-images/${userId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { imageUrl: blob.url };
}
