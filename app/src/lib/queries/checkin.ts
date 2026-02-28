import { db } from "@/lib/db/client";
import { checkinSessions, attendance, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type CheckinSession = typeof checkinSessions.$inferSelect;
export type NewCheckinSession = typeof checkinSessions.$inferInsert;

export async function getActiveSession(): Promise<CheckinSession | null> {
  const results = await db
    .select()
    .from(checkinSessions)
    .where(eq(checkinSessions.isActive, true))
    .orderBy(desc(checkinSessions.openedAt))
    .limit(1);
  return results[0] ?? null;
}

export async function getSessionById(id: string): Promise<CheckinSession | null> {
  const results = await db.select().from(checkinSessions).where(eq(checkinSessions.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createSession(data: NewCheckinSession): Promise<CheckinSession> {
  // Close any existing active sessions first
  await db
    .update(checkinSessions)
    .set({ isActive: false, closedAt: new Date() })
    .where(eq(checkinSessions.isActive, true));
  const results = await db.insert(checkinSessions).values(data).returning();
  return results[0];
}

export async function closeSession(id: string): Promise<void> {
  await db
    .update(checkinSessions)
    .set({ isActive: false, closedAt: new Date() })
    .where(eq(checkinSessions.id, id));
}

// Get all attendance records for a specific date with user info
export async function getCheckinsByDate(date: string) {
  return db
    .select({
      id: attendance.id,
      userId: attendance.userId,
      date: attendance.date,
      createdAt: attendance.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      photoUrl: users.photoUrl,
      classification: users.classification,
      company: users.company,
    })
    .from(attendance)
    .innerJoin(users, eq(attendance.userId, users.id))
    .where(and(eq(attendance.date, date), eq(attendance.type, "regular")))
    .orderBy(desc(attendance.createdAt));
}

// Check if a user already checked in for a date
export async function getExistingCheckin(userId: string, date: string) {
  const results = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, date), eq(attendance.type, "regular")))
    .limit(1);
  return results[0] ?? null;
}
