import { z } from "zod";
import { dateString, timeString } from "./common";

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(512),
  date: dateString,
  time: timeString.default(""),
  attendees: z.array(z.string()).default([]),
  notes: z.string().default(""),
  category: z.string().max(32).default("general"),
  actionItems: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1),
        assignee: z.string().default("Unassigned"),
        completed: z.boolean().default(false),
        dueDate: z.string().nullable().optional(),
      })
    )
    .default([]),
});

export const updateMeetingSchema = createMeetingSchema.partial();

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
