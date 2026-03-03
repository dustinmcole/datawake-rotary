import { z } from "zod";

const ANNOUNCEMENT_CATEGORIES = ["general", "urgent", "event", "committee"] as const;
const ANNOUNCEMENT_ACTIONS = ["publish", "unpublish"] as const;

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(512),
  content: z.string().min(1, "Content is required"),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).default("general"),
  pinned: z.boolean().default(false),
  publish: z.boolean().default(false),
});

export const updateAnnouncementSchema = z.object({
  action: z.enum(ANNOUNCEMENT_ACTIONS).optional(),
  title: z.string().min(1).max(512).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).optional(),
  pinned: z.boolean().optional(),
  publish: z.boolean().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
