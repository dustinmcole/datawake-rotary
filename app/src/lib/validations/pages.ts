import { z } from "zod";

export const createPageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(256)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(512),
  content: z.string().default(""),
  metaDescription: z.string().max(512).default(""),
  published: z.boolean().default(true),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(512).optional(),
  content: z.string().optional(),
  metaDescription: z.string().max(512).optional(),
  published: z.boolean().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
