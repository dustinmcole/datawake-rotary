import { db } from "@/lib/db/client";
import { chatThreads, chatMessages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type ChatThread = typeof chatThreads.$inferSelect;
export type NewChatThread = typeof chatThreads.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export async function getThreadsByUser(userId: string): Promise<ChatThread[]> {
  return db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .orderBy(desc(chatThreads.updatedAt));
}

export async function getThreadById(id: string): Promise<ChatThread | null> {
  const results = await db.select().from(chatThreads).where(eq(chatThreads.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createThread(data: NewChatThread): Promise<ChatThread> {
  const results = await db.insert(chatThreads).values(data).returning();
  return results[0];
}

export async function updateThread(id: string, data: Partial<NewChatThread>): Promise<ChatThread | null> {
  const results = await db.update(chatThreads).set(data).where(eq(chatThreads.id, id)).returning();
  return results[0] ?? null;
}

export async function deleteThread(id: string): Promise<void> {
  await db.delete(chatThreads).where(eq(chatThreads.id, id));
}

export async function getMessagesByThread(threadId: string): Promise<ChatMessage[]> {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(chatMessages.createdAt);
}

export async function createMessage(data: NewChatMessage): Promise<ChatMessage> {
  const results = await db.insert(chatMessages).values(data).returning();
  return results[0];
}

export async function deleteMessage(id: string): Promise<void> {
  await db.delete(chatMessages).where(eq(chatMessages.id, id));
}
