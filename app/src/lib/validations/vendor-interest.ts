import { z } from "zod";

export const createVendorInterestSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(256),
  contactName: z.string().max(256).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().max(64).default(""),
  category: z.string().max(32).default(""),
  website: z.string().url().or(z.literal("")).default(""),
  description: z.string().default(""),
  previousParticipant: z.boolean().default(false),
});

export const processVendorInterestSchema = z.object({
  convertedBy: z.string().default("Admin"),
});

export type CreateVendorInterestInput = z.infer<typeof createVendorInterestSchema>;
export type ProcessVendorInterestInput = z.infer<typeof processVendorInterestSchema>;
