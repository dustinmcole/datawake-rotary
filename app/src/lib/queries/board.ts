import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { boardMeetings, boardResolutions, boardDocuments, boardActionItems, officerTerms } from "@/lib/db/schema";

export type BoardMeeting = typeof boardMeetings.$inferSelect;
export type BoardResolution = typeof boardResolutions.$inferSelect;
export type BoardDocument = typeof boardDocuments.$inferSelect;
export type BoardActionItem = typeof boardActionItems.$inferSelect;
export type OfficerTerm = typeof officerTerms.$inferSelect;

export async function getAllBoardMeetings(): Promise<BoardMeeting[]> {
  return db.select().from(boardMeetings).orderBy(desc(boardMeetings.date));
}
export async function getBoardMeetingById(id: string): Promise<BoardMeeting | null> {
  const [row] = await db.select().from(boardMeetings).where(eq(boardMeetings.id, id));
  return row ?? null;
}
export async function createBoardMeeting(data: Omit<typeof boardMeetings.$inferInsert, "createdAt" | "updatedAt">): Promise<BoardMeeting> {
  const now = new Date();
  await db.insert(boardMeetings).values({ ...data, createdAt: now, updatedAt: now });
  return (await getBoardMeetingById(data.id))!;
}
export async function updateBoardMeeting(id: string, data: Partial<Omit<typeof boardMeetings.$inferInsert, "id" | "createdAt">>): Promise<BoardMeeting | null> {
  await db.update(boardMeetings).set({ ...data, updatedAt: new Date() }).where(eq(boardMeetings.id, id));
  return getBoardMeetingById(id);
}
export async function deleteBoardMeeting(id: string): Promise<void> {
  await db.delete(boardMeetings).where(eq(boardMeetings.id, id));
}

export async function getAllResolutions(): Promise<BoardResolution[]> {
  return db.select().from(boardResolutions).orderBy(desc(boardResolutions.date));
}
export async function getResolutionById(id: string): Promise<BoardResolution | null> {
  const [row] = await db.select().from(boardResolutions).where(eq(boardResolutions.id, id));
  return row ?? null;
}
export async function createResolution(data: Omit<typeof boardResolutions.$inferInsert, "createdAt" | "updatedAt">): Promise<BoardResolution> {
  const now = new Date();
  await db.insert(boardResolutions).values({ ...data, createdAt: now, updatedAt: now });
  return (await getResolutionById(data.id))!;
}
export async function updateResolution(id: string, data: Partial<Omit<typeof boardResolutions.$inferInsert, "id" | "createdAt">>): Promise<BoardResolution | null> {
  await db.update(boardResolutions).set({ ...data, updatedAt: new Date() }).where(eq(boardResolutions.id, id));
  return getResolutionById(id);
}
export async function deleteResolution(id: string): Promise<void> {
  await db.delete(boardResolutions).where(eq(boardResolutions.id, id));
}

export async function getAllBoardDocuments(): Promise<BoardDocument[]> {
  return db.select().from(boardDocuments).orderBy(asc(boardDocuments.category), asc(boardDocuments.title));
}
export async function getBoardDocumentById(id: string): Promise<BoardDocument | null> {
  const [row] = await db.select().from(boardDocuments).where(eq(boardDocuments.id, id));
  return row ?? null;
}
export async function createBoardDocument(data: Omit<typeof boardDocuments.$inferInsert, "createdAt" | "updatedAt">): Promise<BoardDocument> {
  const now = new Date();
  await db.insert(boardDocuments).values({ ...data, createdAt: now, updatedAt: now });
  return (await getBoardDocumentById(data.id))!;
}
export async function updateBoardDocument(id: string, data: Partial<Omit<typeof boardDocuments.$inferInsert, "id" | "createdAt">>): Promise<BoardDocument | null> {
  await db.update(boardDocuments).set({ ...data, updatedAt: new Date() }).where(eq(boardDocuments.id, id));
  return getBoardDocumentById(id);
}
export async function deleteBoardDocument(id: string): Promise<void> {
  await db.delete(boardDocuments).where(eq(boardDocuments.id, id));
}

export async function getAllBoardActionItems(): Promise<BoardActionItem[]> {
  return db.select().from(boardActionItems).orderBy(desc(boardActionItems.createdAt));
}
export async function getBoardActionItemById(id: string): Promise<BoardActionItem | null> {
  const [row] = await db.select().from(boardActionItems).where(eq(boardActionItems.id, id));
  return row ?? null;
}
export async function createBoardActionItem(data: Omit<typeof boardActionItems.$inferInsert, "createdAt" | "updatedAt">): Promise<BoardActionItem> {
  const now = new Date();
  await db.insert(boardActionItems).values({ ...data, createdAt: now, updatedAt: now });
  return (await getBoardActionItemById(data.id))!;
}
export async function updateBoardActionItem(id: string, data: Partial<Omit<typeof boardActionItems.$inferInsert, "id" | "createdAt">>): Promise<BoardActionItem | null> {
  await db.update(boardActionItems).set({ ...data, updatedAt: new Date() }).where(eq(boardActionItems.id, id));
  return getBoardActionItemById(id);
}
export async function deleteBoardActionItem(id: string): Promise<void> {
  await db.delete(boardActionItems).where(eq(boardActionItems.id, id));
}

export async function getAllOfficerTerms(): Promise<OfficerTerm[]> {
  return db.select().from(officerTerms).orderBy(desc(officerTerms.startDate));
}
export async function getOfficerTermById(id: string): Promise<OfficerTerm | null> {
  const [row] = await db.select().from(officerTerms).where(eq(officerTerms.id, id));
  return row ?? null;
}
export async function createOfficerTerm(data: Omit<typeof officerTerms.$inferInsert, "createdAt" | "updatedAt">): Promise<OfficerTerm> {
  const now = new Date();
  await db.insert(officerTerms).values({ ...data, createdAt: now, updatedAt: now });
  return (await getOfficerTermById(data.id))!;
}
export async function updateOfficerTerm(id: string, data: Partial<Omit<typeof officerTerms.$inferInsert, "id" | "createdAt">>): Promise<OfficerTerm | null> {
  await db.update(officerTerms).set({ ...data, updatedAt: new Date() }).where(eq(officerTerms.id, id));
  return getOfficerTermById(id);
}
export async function deleteOfficerTerm(id: string): Promise<void> {
  await db.delete(officerTerms).where(eq(officerTerms.id, id));
}
