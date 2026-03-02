import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts, activities } from "@/lib/db/schema";
import type { Contact, Activity } from "@/lib/types";

// ============================================
// Helpers
// ============================================

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch (error) {
    console.error('Library error:', error);
    return fallback;
  }
}

function rowToContact(row: typeof contacts.$inferSelect, acts: typeof activities.$inferSelect[]): Contact {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    type: row.type as Contact["type"],
    status: row.status as Contact["status"],
    tier: row.tier as Contact["tier"],
    vendorCategory: row.vendorCategory as Contact["vendorCategory"],
    website: row.website,
    address: row.address,
    notes: row.notes,
    activities: acts.map((a) => ({
      id: a.id,
      type: a.type as Activity["type"],
      description: a.description,
      date: a.date,
      createdBy: a.createdBy,
    })),
    tags: parseJson(row.tags, []),
    years: parseJson(row.years, []),
    assignedTo: row.assignedTo,
    logoUrl: row.logoUrl ?? undefined,
    publicVisible: row.publicVisible,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ============================================
// Read
// ============================================

export async function getAllContacts(): Promise<Contact[]> {
  const rows = await db.select().from(contacts).orderBy(contacts.name);
  if (rows.length === 0) return [];

  const acts = await db
    .select()
    .from(activities)
    .where(inArray(activities.contactId, rows.map((r) => r.id)));

  const actsByContact = acts.reduce<Record<string, typeof activities.$inferSelect[]>>((acc, a) => {
    (acc[a.contactId] ??= []).push(a);
    return acc;
  }, {});

  return rows.map((r) => rowToContact(r, actsByContact[r.id] ?? []));
}

export async function getContactsByType(type: string | string[]): Promise<Contact[]> {
  const types = Array.isArray(type) ? type : [type];
  const rows = await db
    .select()
    .from(contacts)
    .where(inArray(contacts.type, types))
    .orderBy(contacts.name);

  if (rows.length === 0) return [];

  const acts = await db
    .select()
    .from(activities)
    .where(inArray(activities.contactId, rows.map((r) => r.id)));

  const actsByContact = acts.reduce<Record<string, typeof activities.$inferSelect[]>>((acc, a) => {
    (acc[a.contactId] ??= []).push(a);
    return acc;
  }, {});

  return rows.map((r) => rowToContact(r, actsByContact[r.id] ?? []));
}

export async function getPublicContacts(type: string | string[]): Promise<Contact[]> {
  const types = Array.isArray(type) ? type : [type];
  const rows = await db
    .select()
    .from(contacts)
    .where(and(inArray(contacts.type, types), eq(contacts.publicVisible, true)))
    .orderBy(contacts.name);

  if (rows.length === 0) return [];

  const acts = await db
    .select()
    .from(activities)
    .where(inArray(activities.contactId, rows.map((r) => r.id)));

  const actsByContact = acts.reduce<Record<string, typeof activities.$inferSelect[]>>((acc, a) => {
    (acc[a.contactId] ??= []).push(a);
    return acc;
  }, {});

  return rows.map((r) => rowToContact(r, actsByContact[r.id] ?? []));
}

export async function getContactById(id: string): Promise<Contact | null> {
  const [row] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!row) return null;

  const acts = await db.select().from(activities).where(eq(activities.contactId, id));
  return rowToContact(row, acts);
}

// ============================================
// Write
// ============================================

export async function createContact(data: Omit<Contact, "createdAt" | "updatedAt">): Promise<Contact> {
  const now = new Date();

  await db.insert(contacts).values({
    id: data.id,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    type: data.type,
    status: data.status,
    tier: data.tier ?? null,
    vendorCategory: data.vendorCategory ?? null,
    website: data.website,
    address: data.address,
    notes: data.notes,
    tags: JSON.stringify(data.tags),
    years: JSON.stringify(data.years),
    assignedTo: data.assignedTo,
    logoUrl: data.logoUrl ?? null,
    publicVisible: data.publicVisible ?? false,
    createdAt: now,
    updatedAt: now,
  });

  // Insert activities
  if (data.activities.length > 0) {
    await db.insert(activities).values(
      data.activities.map((a) => ({
        id: a.id,
        contactId: data.id,
        type: a.type,
        description: a.description,
        date: a.date,
        createdBy: a.createdBy,
      }))
    );
  }

  return (await getContactById(data.id))!;
}

export async function updateContact(id: string, data: Partial<Contact>): Promise<Contact | null> {
  const updates: Partial<typeof contacts.$inferInsert> = { updatedAt: new Date() };

  if (data.name !== undefined) updates.name = data.name;
  if (data.company !== undefined) updates.company = data.company;
  if (data.email !== undefined) updates.email = data.email;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.type !== undefined) updates.type = data.type;
  if (data.status !== undefined) updates.status = data.status;
  if ("tier" in data) updates.tier = data.tier ?? null;
  if ("vendorCategory" in data) updates.vendorCategory = data.vendorCategory ?? null;
  if (data.website !== undefined) updates.website = data.website;
  if (data.address !== undefined) updates.address = data.address;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
  if (data.years !== undefined) updates.years = JSON.stringify(data.years);
  if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo;
  if ("logoUrl" in data) updates.logoUrl = data.logoUrl ?? null;
  if (data.publicVisible !== undefined) updates.publicVisible = data.publicVisible;

  await db.update(contacts).set(updates).where(eq(contacts.id, id));

  // Replace activities if provided
  if (data.activities !== undefined) {
    await db.delete(activities).where(eq(activities.contactId, id));
    if (data.activities.length > 0) {
      await db.insert(activities).values(
        data.activities.map((a) => ({
          id: a.id,
          contactId: id,
          type: a.type,
          description: a.description,
          date: a.date,
          createdBy: a.createdBy,
        }))
      );
    }
  }

  return getContactById(id);
}

export async function deleteContact(id: string): Promise<void> {
  await db.delete(contacts).where(eq(contacts.id, id));
}
