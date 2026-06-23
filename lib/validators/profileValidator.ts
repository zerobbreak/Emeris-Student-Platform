import { z } from "zod";

import { IT_COURSE_CODES } from "@/lib/constants/itCourses";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  course: z.enum(IT_COURSE_CODES).optional(),
  year: z.number().int().min(1).max(4).optional(),
  location: z.string().max(100).optional(),
  githubUrl: z
    .string()
    .url()
    .refine((url) => url.includes("github.com"), {
      message: "GitHub URL must contain github.com",
    })
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url()
    .refine((url) => url.includes("linkedin.com"), {
      message: "LinkedIn URL must contain linkedin.com",
    })
    .optional()
    .or(z.literal("")),
  isOnboarded: z.boolean().optional(),
});

export const addSkillSchema = z
  .object({
    skillId: z.string().min(1).optional(),
    skillName: z.string().min(1).max(50).optional(),
  })
  .refine((data) => data.skillId || data.skillName, {
    message: "Either skillId or skillName must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
