import { z } from "zod";
import { dateString, timeString } from "./common";

const EVENT_CATEGORIES = ["meeting", "service", "social", "fundraiser", "speaker", "general"] as const;
const EVENT_STATUSES = ["pending", "approved", "cancelled"] as const;

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(512),
  description: z.string().max(5000).default(""),
  date: dateString,
  startTime: timeString.default(""),
  endTime: timeString.default(""),
  location: z.string().max(512).default(""),
  category: z.enum(EVENT_CATEGORIES).default("general"),
  rsvpUrl: z.string().url().or(z.literal("")).default(""),
  isPublic: z.boolean().default(false),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(512).optional(),
  description: z.string().max(5000).optional(),
  date: dateString.optional(),
  startTime: timeString.optional(),
  endTime: timeString.optional(),
  location: z.string().max(512).optional(),
  category: z.enum(EVENT_CATEGORIES).optional(),
  rsvpUrl: z.string().url().or(z.literal("")).optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(EVENT_STATUSES).optional(),
  slug: z.string().max(256).nullable().optional(),
  imageUrl: z.string().url().or(z.literal("")).nullable().optional(),
});

export const adminUpdateEventSchema = updateEventSchema.extend({
  action: z.enum(["approve", "reject"]).optional(),
});

export const rsvpSchema = z.object({
  mealChoice: z.string().max(64).nullable().optional(),
  guestCount: z.number().int().min(0).default(0),
  guestNames: z.string().max(512).nullable().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AdminUpdateEventInput = z.infer<typeof adminUpdateEventSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
