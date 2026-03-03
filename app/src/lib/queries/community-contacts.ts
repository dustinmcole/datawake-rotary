import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { communityContacts, communityContactActivities } from "@/lib/db/schema";

export type CommunityContact = typeof communityContacts.$inferSelect & {
  activities?: typeof communityContactActivities.$inferSelect[];
};

export async function getAllCommunityContacts(opts?: {
  search?: string;
  type?: string;
  status?: string;
}): Promise<CommunityContact[]> {
  let rows = await db.select().from(communityContacts).orderBy(communityContacts.lastName);

  if (opts?.type) {
    const types = opts.type.split(",");
    rows = rows.filter((r) => types.includes(r.type));
  }
  if (opts?.status) {
    rows = rows.filter((r) => r.status === opts.status);
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
    );
  }
  return rows;
}

export async function getCommunityContactById(id: string): Promise<CommunityContact | null> {
  const rows = await db
    .select()
    .from(communityContacts)
    .where(eq(communityContacts.id, id))
    .limit(1);
  if (!rows[0]) return null;
  const acts = await db
    .select()
    .from(communityContactActivities)
    .where(eq(communityContactActivities.contactId, id))
    .orderBy(communityContactActivities.activityDate);
  return { ...rows[0], activities: acts };
}

export async function createCommunityContact(data: typeof communityContacts.$inferInsert) {
  const [row] = await db.insert(communityContacts).values(data).returning();
  return row;
}

export async function updateCommunityContact(
  id: string,
  data: Partial<typeof communityContacts.$inferInsert>
) {
  const [row] = await db
    .update(communityContacts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(communityContacts.id, id))
    .returning();
  return row;
}

export async function deleteCommunityContact(id: string) {
  await db.delete(communityContacts).where(eq(communityContacts.id, id));
}

export async function getContactActivities(contactId: string) {
  return db
    .select()
    .from(communityContactActivities)
    .where(eq(communityContactActivities.contactId, contactId))
    .orderBy(communityContactActivities.activityDate);
}

export async function addContactActivity(
  data: typeof communityContactActivities.$inferInsert
) {
  const [row] = await db.insert(communityContactActivities).values(data).returning();
  return row;
}

export async function bulkInsertCommunityContacts(
  rows: typeof communityContacts.$inferInsert[]
) {
  if (rows.length === 0) return [];
  return db.insert(communityContacts).values(rows).returning();
}
