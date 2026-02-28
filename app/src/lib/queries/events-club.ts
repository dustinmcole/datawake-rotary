import { db } from "@/lib/db/client";
import { events, eventRsvps } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type NewEventRsvp = typeof eventRsvps.$inferInsert;

export type ClubEvent = typeof events.$inferSelect;
export type NewClubEvent = typeof events.$inferInsert;

export async function getAllClubEvents(): Promise<ClubEvent[]> {
  return db.select().from(events).orderBy(desc(events.date));
}

export async function getClubEventById(id: string): Promise<ClubEvent | null> {
  const results = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return results[0] ?? null;
}

export async function getClubEventBySlug(slug: string): Promise<ClubEvent | null> {
  const results = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return results[0] ?? null;
}

export async function getUpcomingClubEvents(): Promise<ClubEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  return db
    .select()
    .from(events)
    .where(gte(events.date, today))
    .orderBy(events.date);
}

export async function getApprovedPublicEvents(): Promise<ClubEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  return db
    .select()
    .from(events)
    .where(and(gte(events.date, today), eq(events.status, "approved"), eq(events.isPublic, true)))
    .orderBy(events.date);
}

export async function getClubEventsByStatus(status: string): Promise<ClubEvent[]> {
  return db
    .select()
    .from(events)
    .where(eq(events.status, status))
    .orderBy(desc(events.createdAt));
}

export async function createClubEvent(data: NewClubEvent): Promise<ClubEvent> {
  const results = await db.insert(events).values(data).returning();
  return results[0];
}

export async function updateClubEvent(id: string, data: Partial<NewClubEvent>): Promise<ClubEvent | null> {
  const results = await db.update(events).set(data).where(eq(events.id, id)).returning();
  return results[0] ?? null;
}

export async function approveClubEvent(id: string, approvedBy: string): Promise<ClubEvent | null> {
  const results = await db
    .update(events)
    .set({ status: "approved", approvedBy })
    .where(eq(events.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteClubEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}

export async function getRsvpsForEvent(eventId: string): Promise<EventRsvp[]> {
  return db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
}

export async function getUserRsvps(userId: string): Promise<EventRsvp[]> {
  return db.select().from(eventRsvps).where(eq(eventRsvps.userId, userId));
}

export async function getRsvp(eventId: string, userId: string): Promise<EventRsvp | null> {
  const results = await db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
    .limit(1);
  return results[0] ?? null;
}

export async function createRsvp(data: NewEventRsvp): Promise<EventRsvp> {
  const results = await db.insert(eventRsvps).values(data).returning();
  return results[0];
}

export async function deleteRsvp(eventId: string, userId: string): Promise<void> {
  const existing = await getRsvp(eventId, userId);
  if (existing) {
    await db.delete(eventRsvps).where(eq(eventRsvps.id, existing.id));
  }
}

export async function getRsvpCountForEvent(eventId: string): Promise<number> {
  const rsvps = await getRsvpsForEvent(eventId);
  return rsvps.length;
}

export async function getEventsSubmittedBy(userId: string): Promise<ClubEvent[]> {
  return db
    .select()
    .from(events)
    .where(eq(events.submittedBy, userId))
    .orderBy(desc(events.createdAt));
}
