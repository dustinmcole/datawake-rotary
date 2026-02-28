import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import type { Task } from "@/lib/types";

function rowToTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    assignee: row.assignee,
    category: row.category as Task["category"],
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const rows = await db.select().from(tasks).orderBy(tasks.createdAt);
  return rows.map(rowToTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
  return row ? rowToTask(row) : null;
}

export async function createTask(data: Omit<Task, "createdAt" | "updatedAt">): Promise<Task> {
  const now = new Date();
  await db.insert(tasks).values({
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assignee: data.assignee,
    category: data.category,
    dueDate: data.dueDate,
    createdAt: now,
    updatedAt: now,
  });
  return (await getTaskById(data.id))!;
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  const updates: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };

  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.status !== undefined) updates.status = data.status;
  if (data.priority !== undefined) updates.priority = data.priority;
  if (data.assignee !== undefined) updates.assignee = data.assignee;
  if (data.category !== undefined) updates.category = data.category;
  if (data.dueDate !== undefined) updates.dueDate = data.dueDate;

  await db.update(tasks).set(updates).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
}
