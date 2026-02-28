import { db } from "@/lib/db/client";
import { announcements } from "@/lib/db/schema";
import { eq, desc, isNotNull } from "drizzle-orm";

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  return db
    .select()
    .from(announcements)
    .where(isNotNull(announcements.publishedAt))
    .orderBy(desc(announcements.publishedAt));
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const results = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createAnnouncement(data: NewAnnouncement): Promise<Announcement> {
  const results = await db.insert(announcements).values(data).returning();
  return results[0];
}

export async function updateAnnouncement(id: string, data: Partial<NewAnnouncement>): Promise<Announcement | null> {
  const results = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
  return results[0] ?? null;
}

export async function pinAnnouncement(id: string): Promise<Announcement | null> {
  const results = await db
    .update(announcements)
    .set({ pinned: true })
    .where(eq(announcements.id, id))
    .returning();
  return results[0] ?? null;
}

export async function unpinAnnouncement(id: string): Promise<Announcement | null> {
  const results = await db
    .update(announcements)
    .set({ pinned: false })
    .where(eq(announcements.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await db.delete(announcements).where(eq(announcements.id, id));
}
