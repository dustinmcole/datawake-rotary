import { z } from "zod";
import { dateString } from "./common";

export const createCheckinSessionSchema = z.object({
  meetingDate: dateString,
  pin: z
    .string()
    .min(4, "PIN must be at least 4 characters")
    .max(8, "PIN must be at most 8 characters")
    .regex(/^\d+$/, "PIN must be numeric"),
  notes: z.string().default(""),
});

export const checkinSchema = z.object({
  memberId: z.string().min(1, "memberId is required"),
});

export type CreateCheckinSessionInput = z.infer<typeof createCheckinSessionSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
