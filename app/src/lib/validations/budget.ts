import { z } from "zod";
import { dateString } from "./common";

const BUDGET_TYPES = ["income", "expense"] as const;

export const createBudgetItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(512),
  category: z.string().min(1, "Category is required").max(32),
  type: z.enum(BUDGET_TYPES),
  amount: z.number().nonnegative().default(0),
  budgeted: z.number().nonnegative().default(0),
  date: dateString.or(z.literal("")).default(""),
  notes: z.string().default(""),
});

export const updateBudgetItemSchema = createBudgetItemSchema.partial();

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>;
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>;
