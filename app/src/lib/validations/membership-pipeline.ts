import { z } from "zod";
import { dateString } from "./common";

const PROSPECT_SOURCES = [
  "referral", "walk_in", "community_event", "web_inquiry", "crm_import",
] as const;

const PROSPECT_STAGES = [
  "identified", "reached_out", "visited", "sponsor_found",
  "applied", "board_approved", "inducted", "declined",
] as const;

const ACTIVITY_TYPES = [
  "stage_change", "note", "call", "email", "meeting", "visit", "other",
] as const;

export const createProspectSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(128),
  lastName: z.string().min(1, "Last name is required").max(128),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().max(64).default(""),
  company: z.string().max(256).default(""),
  classification: z.string().max(128).default(""),
  source: z.enum(PROSPECT_SOURCES).default("web_inquiry"),
  referredBy: z.string().nullable().optional(),
  sponsorId: z.string().nullable().optional(),
  stage: z.enum(PROSPECT_STAGES).default("identified"),
  nextAction: z.string().max(512).default(""),
  nextActionDue: dateString.nullable().optional(),
  sourceInquiryId: z.string().nullable().optional(),
  sourceContactId: z.string().nullable().optional(),
  notes: z.string().default(""),
});

export const updateProspectSchema = createProspectSchema.partial();

export const createProspectActivitySchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  fromStage: z.string().nullable().optional(),
  toStage: z.string().nullable().optional(),
  description: z.string().default(""),
  activityDate: z.string().optional(),
});

export type CreateProspectInput = z.infer<typeof createProspectSchema>;
export type UpdateProspectInput = z.infer<typeof updateProspectSchema>;
export type CreateProspectActivityInput = z.infer<typeof createProspectActivitySchema>;
