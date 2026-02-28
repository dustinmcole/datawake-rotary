import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/auth";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const results = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return results[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return results[0] ?? null;
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users);
}

export async function getAllMembers(): Promise<User[]> {
  return db.select().from(users).where(eq(users.status, "active"));
}

export async function createUser(data: NewUser): Promise<User> {
  const results = await db.insert(users).values(data).returning();
  return results[0];
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | null> {
  const results = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return results[0] ?? null;
}

export async function updateUserRoles(id: string, roles: Role[]): Promise<User | null> {
  const results = await db
    .update(users)
    .set({ roles: JSON.stringify(roles) })
    .where(eq(users.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

export function parseUserRoles(user: User): Role[] {
  try {
    return JSON.parse(user.roles) as Role[];
  } catch {
    return ["member"];
  }
}
