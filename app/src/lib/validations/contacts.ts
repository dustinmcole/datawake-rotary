import { z } from "zod";

const CONTACT_TYPES = [
  "sponsor", "vendor", "potential_sponsor", "potential_vendor", "partner", "other",
] as const;
const PIPELINE_STATUSES = ["lead", "prospect", "active", "lapsed", "declined"] as const;
const ACTIVITY_TYPES = [
  "note", "call", "email", "meeting", "proposal", "contract", "renewal", "other",
] as const;

export const contactActivitySchema = z.object({
  id: z.string().optional(),
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().default(""),
  date: z.string(),
  createdBy: z.string().default(""),
});

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  company: z.string().max(256).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().max(64).default(""),
  type: z.enum(CONTACT_TYPES),
  status: z.enum(PIPELINE_STATUSES).default("lead"),
  tier: z.string().max(32).nullable().optional(),
  vendorCategory: z.string().max(32).nullable().optional(),
  website: z.string().url().or(z.literal("")).default(""),
  address: z.string().max(512).default(""),
  notes: z.string().default(""),
  activities: z.array(contactActivitySchema).default([]),
  tags: z.array(z.string()).default([]),
  years: z.array(z.number().int()).default([]),
  assignedTo: z.string().max(128).default("Unassigned"),
  logoUrl: z.string().url().or(z.literal("")).nullable().optional(),
  publicVisible: z.boolean().default(false),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
