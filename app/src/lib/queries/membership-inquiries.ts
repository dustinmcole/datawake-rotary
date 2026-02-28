import { db } from "@/lib/db/client";
import { membershipInquiries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type MembershipInquiry = typeof membershipInquiries.$inferSelect;
export type NewMembershipInquiry = typeof membershipInquiries.$inferInsert;

export async function getAllInquiries(): Promise<MembershipInquiry[]> {
  return db.select().from(membershipInquiries).orderBy(desc(membershipInquiries.createdAt));
}

export async function getNewInquiries(): Promise<MembershipInquiry[]> {
  return db
    .select()
    .from(membershipInquiries)
    .where(eq(membershipInquiries.status, "new"))
    .orderBy(desc(membershipInquiries.createdAt));
}

export async function getInquiryById(id: string): Promise<MembershipInquiry | null> {
  const results = await db.select().from(membershipInquiries).where(eq(membershipInquiries.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createInquiry(data: NewMembershipInquiry): Promise<MembershipInquiry> {
  const results = await db.insert(membershipInquiries).values(data).returning();
  return results[0];
}

export async function updateInquiry(id: string, data: Partial<NewMembershipInquiry>): Promise<MembershipInquiry | null> {
  const results = await db.update(membershipInquiries).set(data).where(eq(membershipInquiries.id, id)).returning();
  return results[0] ?? null;
}

export async function deleteInquiry(id: string): Promise<void> {
  await db.delete(membershipInquiries).where(eq(membershipInquiries.id, id));
}
