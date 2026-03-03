import { z } from "zod";

export const createInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  email: z.string().email("Valid email required"),
  phone: z.string().max(64).default(""),
  company: z.string().max(256).default(""),
  classification: z.string().max(128).default(""),
  reason: z.string().default(""),
  referredBy: z.string().max(256).default(""),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
