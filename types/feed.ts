export type FeedAuthor = {
  id: string;
  name: string;
  profileImage: string | null;
  course: string | null;
  year: number | null;
};

export type FeedComment = {
  id: string;
  postId: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
  likedByCreator: boolean;
  replyToId: string | null;
  threadId: string | null;
  createdAt: string;
  author: FeedAuthor;
};

export type FeedPost = {
  id: string;
  text: string;
  imageUrl: string | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: string;
  author: FeedAuthor;
  comments: FeedComment[];
};
