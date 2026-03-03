import { z } from "zod";
import { dateString } from "./common";

export const updateEventConfigSchema = z.object({
  eventName: z.string().max(256).optional(),
  eventDate: dateString.optional(),
  eventTime: z.string().max(32).optional(),
  venue: z.string().max(256).optional(),
  venueAddress: z.string().max(512).optional(),
  ticketUrlGeneral: z.string().url().or(z.literal("")).optional(),
  ticketUrlVip: z.string().url().or(z.literal("")).optional(),
  priceGeneral: z.number().nonnegative().optional(),
  priceVip: z.number().nonnegative().optional(),
  heroImageUrl: z.string().url().or(z.literal("")).optional(),
});

export type UpdateEventConfigInput = z.infer<typeof updateEventConfigSchema>;
