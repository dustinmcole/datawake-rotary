import { z } from "zod";
import { dateString } from "./common";

const ATTENDANCE_TYPES = ["regular", "makeup", "online", "service"] as const;

export const createAttendanceSchema = z.object({
  date: dateString,
  type: z.enum(ATTENDANCE_TYPES).default("regular"),
  makeupClub: z.string().max(256).nullable().optional(),
  notes: z.string().default(""),
});

export const bulkAttendanceSchema = z.object({
  date: dateString,
  attendees: z.array(z.string()).min(1, "At least one attendee is required"),
  type: z.enum(ATTENDANCE_TYPES).default("regular"),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
