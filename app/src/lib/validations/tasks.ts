import { z } from "zod";
import { dateString } from "./common";

const TASK_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(512),
  description: z.string().default(""),
  status: z.enum(TASK_STATUSES).default("todo"),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  assignee: z.string().max(128).default("Unassigned"),
  category: z.string().max(32).default("general"),
  dueDate: dateString.or(z.literal("")).default(""),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
