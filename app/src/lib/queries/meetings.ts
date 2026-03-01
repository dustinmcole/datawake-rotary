import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings, actionItems } from "@/lib/db/schema";
import type { Meeting } from "@/lib/types";

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch (error) {
    console.error('Library error:', error);
    return fallback;
  }
}

function rowToMeeting(
  row: typeof meetings.$inferSelect,
  items: typeof actionItems.$inferSelect[]
): Meeting {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    attendees: parseJson(row.attendees, []),
    notes: row.notes,
    actionItems: items.map((ai) => ({
      id: ai.id,
      text: ai.text,
      assignee: ai.assignee,
      completed: ai.completed,
      dueDate: ai.dueDate ?? undefined,
    })),
    category: row.category as Meeting["category"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAllMeetings(): Promise<Meeting[]> {
  const rows = await db.select().from(meetings).orderBy(meetings.date);
  if (rows.length === 0) return [];

  const items = await db
    .select()
    .from(actionItems)
    .where(inArray(actionItems.meetingId, rows.map((r) => r.id)));

  const itemsByMeeting = items.reduce<Record<string, typeof actionItems.$inferSelect[]>>(
    (acc, ai) => {
      (acc[ai.meetingId] ??= []).push(ai);
      return acc;
    },
    {}
  );

  return rows.map((r) => rowToMeeting(r, itemsByMeeting[r.id] ?? []));
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const [row] = await db.select().from(meetings).where(eq(meetings.id, id));
  if (!row) return null;

  const items = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.meetingId, id));

  return rowToMeeting(row, items);
}

export async function createMeeting(data: Omit<Meeting, "createdAt" | "updatedAt">): Promise<Meeting> {
  const now = new Date();

  await db.insert(meetings).values({
    id: data.id,
    title: data.title,
    date: data.date,
    time: data.time,
    attendees: JSON.stringify(data.attendees),
    notes: data.notes,
    category: data.category,
    createdAt: now,
    updatedAt: now,
  });

  if (data.actionItems.length > 0) {
    await db.insert(actionItems).values(
      data.actionItems.map((ai) => ({
        id: ai.id,
        meetingId: data.id,
        text: ai.text,
        assignee: ai.assignee,
        completed: ai.completed,
        dueDate: ai.dueDate ?? null,
      }))
    );
  }

  return (await getMeetingById(data.id))!;
}

export async function updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting | null> {
  const updates: Partial<typeof meetings.$inferInsert> = { updatedAt: new Date() };

  if (data.title !== undefined) updates.title = data.title;
  if (data.date !== undefined) updates.date = data.date;
  if (data.time !== undefined) updates.time = data.time;
  if (data.attendees !== undefined) updates.attendees = JSON.stringify(data.attendees);
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.category !== undefined) updates.category = data.category;

  await db.update(meetings).set(updates).where(eq(meetings.id, id));

  if (data.actionItems !== undefined) {
    await db.delete(actionItems).where(eq(actionItems.meetingId, id));
    if (data.actionItems.length > 0) {
      await db.insert(actionItems).values(
        data.actionItems.map((ai) => ({
          id: ai.id,
          meetingId: id,
          text: ai.text,
          assignee: ai.assignee,
          completed: ai.completed,
          dueDate: ai.dueDate ?? null,
        }))
      );
    }
  }

  return getMeetingById(id);
}

export async function deleteMeeting(id: string): Promise<void> {
  await db.delete(meetings).where(eq(meetings.id, id));
}
