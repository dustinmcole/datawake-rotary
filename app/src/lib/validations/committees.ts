import { z } from "zod";

const COMMITTEE_CATEGORIES = ["standing", "special", "ad_hoc"] as const;
const COMMITTEE_MEMBER_ROLES = ["chair", "co-chair", "member"] as const;
const COMMITTEE_ACTIONS = ["add_member", "remove_member"] as const;

export const createCommitteeSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  description: z.string().default(""),
  category: z.enum(COMMITTEE_CATEGORIES).default("standing"),
  chairUserId: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export const updateCommitteeSchema = z.object({
  action: z.enum(COMMITTEE_ACTIONS).optional(),
  userId: z.string().optional(),
  role: z.enum(COMMITTEE_MEMBER_ROLES).optional(),
  name: z.string().min(1).max(256).optional(),
  description: z.string().optional(),
  category: z.enum(COMMITTEE_CATEGORIES).optional(),
  chairUserId: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export type CreateCommitteeInput = z.infer<typeof createCommitteeSchema>;
export type UpdateCommitteeInput = z.infer<typeof updateCommitteeSchema>;
