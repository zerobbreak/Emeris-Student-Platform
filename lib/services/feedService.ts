import { desc } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { feedPosts } from "@/lib/db/schema";
import type { FeedAuthor, FeedComment, FeedPost } from "@/types/feed";

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

  return rows.map((row) => ({
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
  }));
}
