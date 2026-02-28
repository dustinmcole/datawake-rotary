import { db } from "@/lib/db/client";
import { attendance } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;

export async function getAttendanceByUser(userId: string): Promise<Attendance[]> {
  return db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.date));
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  return db.select().from(attendance).where(eq(attendance.date, date));
}

export async function getAttendanceRecord(id: string): Promise<Attendance | null> {
  const results = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createAttendance(data: NewAttendance): Promise<Attendance> {
  const results = await db.insert(attendance).values(data).returning();
  return results[0];
}

export async function updateAttendance(id: string, data: Partial<NewAttendance>): Promise<Attendance | null> {
  const results = await db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
  return results[0] ?? null;
}

export async function deleteAttendance(id: string): Promise<void> {
  await db.delete(attendance).where(eq(attendance.id, id));
}

// Calculate attendance rate for a user (present / total meetings)
export async function getAttendanceRate(userId: string): Promise<number> {
  const records = await getAttendanceByUser(userId);
  const regularMeetings = records.filter((r) => r.type === "regular").length;
  const makeups = records.filter((r) => r.type === "makeup").length;
  // Simple rate — would need total meetings count for accurate %; returns makeup-adjusted count
  return regularMeetings + makeups;
}

// Get attendance records within a date range
export async function getAttendanceByUserInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Attendance[]> {
  const records = await getAttendanceByUser(userId);
  return records.filter((r) => r.date >= startDate && r.date <= endDate);
}

// Get the current Rotary year date range (Jul 1 – Jun 30)
export function getRotaryYear(): { start: string; end: string; label: string } {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  const startYear = month < 6 ? year - 1 : year;
  return {
    start: `${startYear}-07-01`,
    end: `${startYear + 1}-06-30`,
    label: `${startYear}–${startYear + 1}`,
  };
}

// Estimate the number of meeting weeks elapsed in the current Rotary year
export function getWeeksElapsedInRotaryYear(start: string): number {
  const startDate = new Date(start + "T00:00:00");
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
}
