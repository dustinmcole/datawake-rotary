import { db } from "@/lib/db/client";
import { committees, committeeMemberships, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type Committee = typeof committees.$inferSelect;
export type NewCommittee = typeof committees.$inferInsert;
export type CommitteeMembership = typeof committeeMemberships.$inferSelect;

export async function getAllCommittees(): Promise<Committee[]> {
  return db.select().from(committees).where(eq(committees.active, true));
}

export async function getCommitteeById(id: string): Promise<Committee | null> {
  const results = await db.select().from(committees).where(eq(committees.id, id)).limit(1);
  return results[0] ?? null;
}

export async function getCommitteeWithMembers(id: string) {
  const committee = await getCommitteeById(id);
  if (!committee) return null;

  const memberships = await db
    .select({ membership: committeeMemberships, user: users })
    .from(committeeMemberships)
    .innerJoin(users, eq(committeeMemberships.userId, users.id))
    .where(eq(committeeMemberships.committeeId, id));

  return { ...committee, members: memberships };
}

export async function createCommittee(data: NewCommittee): Promise<Committee> {
  const results = await db.insert(committees).values(data).returning();
  return results[0];
}

export async function updateCommittee(id: string, data: Partial<NewCommittee>): Promise<Committee | null> {
  const results = await db.update(committees).set(data).where(eq(committees.id, id)).returning();
  return results[0] ?? null;
}

export async function addCommitteeMember(
  committeeId: string,
  userId: string,
  role = "member"
): Promise<CommitteeMembership> {
  const { generateId } = await import("@/lib/utils");
  const results = await db
    .insert(committeeMemberships)
    .values({ id: generateId(), committeeId, userId, role })
    .returning();
  return results[0];
}

export async function removeCommitteeMember(committeeId: string, userId: string): Promise<void> {
  await db
    .delete(committeeMemberships)
    .where(and(eq(committeeMemberships.committeeId, committeeId), eq(committeeMemberships.userId, userId)));
}

export async function getUserCommittees(userId: string): Promise<Committee[]> {
  const results = await db
    .select({ committee: committees })
    .from(committeeMemberships)
    .innerJoin(committees, eq(committeeMemberships.committeeId, committees.id))
    .where(eq(committeeMemberships.userId, userId));
  return results.map((r) => r.committee);
}
