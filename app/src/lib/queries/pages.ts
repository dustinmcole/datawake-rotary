import { db } from "@/lib/db/client";
import { pages, pageVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PageVersion = typeof pageVersions.$inferSelect;

export async function getAllPages(): Promise<Page[]> {
  return db.select().from(pages).orderBy(pages.slug);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const results = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return results[0] ?? null;
}

export async function getPageById(id: string): Promise<Page | null> {
  const results = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createPage(data: NewPage): Promise<Page> {
  const results = await db.insert(pages).values(data).returning();
  return results[0];
}

export async function updatePage(id: string, data: Partial<NewPage>): Promise<Page | null> {
  const results = await db.update(pages).set(data).where(eq(pages.id, id)).returning();
  return results[0] ?? null;
}

export async function createPageVersion(
  pageId: string,
  content: string,
  version: number,
  editedBy: string
): Promise<PageVersion> {
  const { generateId } = await import("@/lib/utils");
  const results = await db
    .insert(pageVersions)
    .values({ id: generateId(), pageId, content, version, editedBy })
    .returning();
  return results[0];
}

export async function getVersionHistory(pageId: string): Promise<PageVersion[]> {
  return db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, pageId))
    .orderBy(desc(pageVersions.version));
}

export async function deletePage(id: string): Promise<void> {
  await db.delete(pages).where(eq(pages.id, id));
}
