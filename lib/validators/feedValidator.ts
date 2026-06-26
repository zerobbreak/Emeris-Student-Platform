import { z } from "zod";

export const createFeedPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Post text is required")
    .max(2000, "Post must be 2000 characters or fewer"),
  imageUrl: z
    .string()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),
});

export type CreateFeedPostInput = z.infer<typeof createFeedPostSchema>;
