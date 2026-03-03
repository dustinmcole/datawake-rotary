import { z } from "zod";

/** YYYY-MM-DD date string */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

/** HH:MM time string (or empty) */
export const timeString = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format")
  .or(z.literal(""));
