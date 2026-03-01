import { eq, desc, asc, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { prospects, prospectActivities, users } from "@/lib/db/schema";

// ============================================
// Types
// ============================================

export type Prospect = typeof prospects.$inferSelect;
export type NewProspect = typeof prospects.$inferInsert;
export type ProspectActivity = typeof prospectActivities.$inferSelect;
export type NewProspectActivity = typeof prospectActivities.$inferInsert;

export const STAGES = [
  "identified",
  "reached_out",
  "visited",
  "sponsor_found",
  "applied",
  "board_approved",
  "inducted",
  "declined",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  identified: "Identified",
  reached_out: "Reached Out",
  visited: "Visited",
  sponsor_found: "Sponsor Found",
  applied: "Applied",
  board_approved: "Board Approved",
  inducted: "Inducted",
  declined: "Declined",
};

export const STAGE_COLORS: Record<Stage, string> = {
  identified: "bg-gray-100 text-gray-700 border-gray-300",
  reached_out: "bg-blue-100 text-blue-700 border-blue-300",
  visited: "bg-purple-100 text-purple-700 border-purple-300",
  sponsor_found: "bg-amber-100 text-amber-700 border-amber-300",
  applied: "bg-orange-100 text-orange-700 border-orange-300",
  board_approved: "bg-emerald-100 text-emerald-700 border-emerald-300",
  inducted: "bg-green-100 text-green-800 border-green-300",
  declined: "bg-red-100 text-red-700 border-red-300",
};

export const SOURCE_LABELS: Record<string, string> = {
  referral: "Referral",
  walk_in: "Walk-in",
  community_event: "Community Event",
  web_inquiry: "Web Inquiry",
  crm_import: "CRM Import",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  stage_change: "Stage Change",
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  visit: "Visit",
  other: "Other",
};

// ============================================
// Prospects — Read
// ============================================

export async function getAllProspects(): Promise<Prospect[]> {
  return db.select().from(prospects).orderBy(desc(prospects.updatedAt));
}

export async function getProspectsByStage(stage: string): Promise<Prospect[]> {
  return db
    .select()
    .from(prospects)
    .where(eq(prospects.stage, stage))
    .orderBy(asc(prospects.stageUpdatedAt));
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const [row] = await db.select().from(prospects).where(eq(prospects.id, id));
  return row ?? null;
}

export async function searchProspects(query: string): Promise<Prospect[]> {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(prospects)
    .where(
      or(
        ilike(prospects.firstName, pattern),
        ilike(prospects.lastName, pattern),
        ilike(prospects.email, pattern),
        ilike(prospects.company, pattern)
      )
    )
    .orderBy(desc(prospects.updatedAt));
}

// ============================================
// Prospects — Write
// ============================================

export async function createProspect(data: NewProspect): Promise<Prospect> {
  const [row] = await db.insert(prospects).values(data).returning();
  return row;
}

export async function updateProspect(
  id: string,
  data: Partial<NewProspect>
): Promise<Prospect | null> {
  const updates = { ...data, updatedAt: new Date() };
  const [row] = await db
    .update(prospects)
    .set(updates)
    .where(eq(prospects.id, id))
    .returning();
  return row ?? null;
}

export async function deleteProspect(id: string): Promise<void> {
  await db.delete(prospects).where(eq(prospects.id, id));
}

// ============================================
// Activities — Read
// ============================================

export async function getActivitiesForProspect(
  prospectId: string
): Promise<ProspectActivity[]> {
  return db
    .select()
    .from(prospectActivities)
    .where(eq(prospectActivities.prospectId, prospectId))
    .orderBy(desc(prospectActivities.activityDate));
}

// ============================================
// Activities — Write
// ============================================

export async function createProspectActivity(
  data: NewProspectActivity
): Promise<ProspectActivity> {
  const [row] = await db.insert(prospectActivities).values(data).returning();
  return row;
}

// ============================================
// Helpers — user lookup for sponsor/referrer
// ============================================

export async function getMembersForSelect(): Promise<
  { id: string; firstName: string; lastName: string }[]
> {
  return db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.status, "active"))
    .orderBy(asc(users.lastName));
}
