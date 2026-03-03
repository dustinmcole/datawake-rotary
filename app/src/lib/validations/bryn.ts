import { z } from "zod";

export const brynChatSchema = z.object({
  messages: z.array(z.unknown()).min(1, "At least one message is required"),
  agentContext: z.enum(["member", "website", "operations", "uncorked"]).default("member"),
  threadId: z.string().optional(),
});

export const createThreadSchema = z.object({
  title: z.string().max(256).default("New conversation"),
});

export type BrynChatInput = z.infer<typeof brynChatSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
