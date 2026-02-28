import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { budgetItems } from "@/lib/db/schema";
import type { BudgetItem } from "@/lib/types";

function rowToBudgetItem(row: typeof budgetItems.$inferSelect): BudgetItem {
  return {
    id: row.id,
    description: row.description,
    category: row.category as BudgetItem["category"],
    type: row.type as BudgetItem["type"],
    amount: Number(row.amount),
    budgeted: Number(row.budgeted),
    date: row.date,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllBudgetItems(): Promise<BudgetItem[]> {
  const rows = await db.select().from(budgetItems).orderBy(budgetItems.date);
  return rows.map(rowToBudgetItem);
}

export async function getBudgetItemById(id: string): Promise<BudgetItem | null> {
  const [row] = await db.select().from(budgetItems).where(eq(budgetItems.id, id));
  return row ? rowToBudgetItem(row) : null;
}

export async function createBudgetItem(data: Omit<BudgetItem, "createdAt">): Promise<BudgetItem> {
  await db.insert(budgetItems).values({
    id: data.id,
    description: data.description,
    category: data.category,
    type: data.type,
    amount: String(data.amount),
    budgeted: String(data.budgeted),
    date: data.date,
    notes: data.notes,
    createdAt: new Date(),
  });
  return (await getBudgetItemById(data.id))!;
}

export async function updateBudgetItem(id: string, data: Partial<BudgetItem>): Promise<BudgetItem | null> {
  const updates: Partial<typeof budgetItems.$inferInsert> = {};

  if (data.description !== undefined) updates.description = data.description;
  if (data.category !== undefined) updates.category = data.category;
  if (data.type !== undefined) updates.type = data.type;
  if (data.amount !== undefined) updates.amount = String(data.amount);
  if (data.budgeted !== undefined) updates.budgeted = String(data.budgeted);
  if (data.date !== undefined) updates.date = data.date;
  if (data.notes !== undefined) updates.notes = data.notes;

  await db.update(budgetItems).set(updates).where(eq(budgetItems.id, id));
  return getBudgetItemById(id);
}

export async function deleteBudgetItem(id: string): Promise<void> {
  await db.delete(budgetItems).where(eq(budgetItems.id, id));
}
