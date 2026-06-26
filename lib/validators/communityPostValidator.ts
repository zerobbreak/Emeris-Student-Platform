import { z } from "zod";

const hiveProjectStatuses = [
  "idea",
  "planning",
  "development",
  "testing",
  "completed",
] as const;

const tagSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(8, "Use up to 8 tags");

const imageUrlSchema = z
  .string()
  .url("Enter a valid image URL")
  .optional()
  .or(z.literal(""));

const baseFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  excerpt: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or fewer"),
  tags: tagSchema,
  imageUrl: imageUrlSchema,
  projectId: z.string().trim().max(64).optional().or(z.literal("")),
  projectTitle: z.string().trim().max(200).optional().or(z.literal("")),
};

export const createProjectListingPostSchema = z.object({
  kind: z.literal("project"),
  ...baseFields,
  projectTitle: z.string().trim().min(1, "Project name is required").max(200),
  projectStatus: z.enum(hiveProjectStatuses, {
    message: "Select a project status",
  }),
  technologies: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Add at least one technology")
    .max(12),
});

export const createAssistancePostSchema = z.object({
  kind: z.literal("assistance"),
  title: baseFields.title,
  excerpt: baseFields.excerpt,
  tags: baseFields.tags,
  imageUrl: baseFields.imageUrl,
  projectId: z.string().trim().min(1, "Select a Hive project"),
  projectTitle: z.string().trim().min(1, "Select a Hive project").max(200),
  assistanceArea: z
    .string()
    .trim()
    .min(1, "Describe what you need help with")
    .max(200),
});

export const createTipPostSchema = z.object({
  kind: z.literal("tip"),
  ...baseFields,
  tipFocus: z
    .string()
    .trim()
    .min(1, "Describe the focus of your tip")
    .max(200),
});

export const createCommunityPostSchema = z.discriminatedUnion("kind", [
  createProjectListingPostSchema,
  createAssistancePostSchema,
  createTipPostSchema,
]);

export type CreateCommunityPostInput = z.infer<
  typeof createCommunityPostSchema
>;

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
