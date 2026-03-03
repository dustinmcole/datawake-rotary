import { z } from "zod";

const MEMBER_TYPES = ["active", "honorary", "alumni", "leave", "prospect"] as const;
const MEMBER_STATUSES = ["active", "inactive", "suspended"] as const;

export const createMemberSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().max(128).default(""),
  lastName: z.string().max(128).default(""),
  phone: z.string().max(64).default(""),
  company: z.string().max(256).default(""),
  classification: z.string().max(128).default(""),
  memberType: z.enum(MEMBER_TYPES).default("active"),
  roles: z.array(z.string()).default(["member"]),
  clerkId: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().max(512).optional(),
  photoUrl: z.string().url().or(z.literal("")).optional(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().max(128).optional(),
  lastName: z.string().max(128).optional(),
  phone: z.string().max(64).optional(),
  company: z.string().max(256).optional(),
  classification: z.string().max(128).optional(),
  memberType: z.enum(MEMBER_TYPES).optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
  bio: z.string().optional(),
  address: z.string().max(512).optional(),
  photoUrl: z.string().url().or(z.literal("")).optional(),
  roles: z.array(z.string()).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().max(128).default(""),
  lastName: z.string().max(128).default(""),
  roles: z.array(z.string()).default(["member"]),
});

export const importMembersSchema = z.object({
  csvText: z.string().min(1, "CSV text required"),
  preview: z.boolean().default(false),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ImportMembersInput = z.infer<typeof importMembersSchema>;
