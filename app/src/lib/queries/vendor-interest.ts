import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vendorInterestSubmissions } from "@/lib/db/schema";

export type VendorInterestSubmission = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  website: string;
  description: string;
  previousParticipant: boolean;
  processed: boolean;
  contactId: string | null;
  createdAt: string;
};

function rowToSubmission(row: typeof vendorInterestSubmissions.$inferSelect): VendorInterestSubmission {
  return {
    id: row.id,
    businessName: row.businessName,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone,
    category: row.category,
    website: row.website,
    description: row.description,
    previousParticipant: row.previousParticipant,
    processed: row.processed,
    contactId: row.contactId ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllSubmissions(): Promise<VendorInterestSubmission[]> {
  const rows = await db
    .select()
    .from(vendorInterestSubmissions)
    .orderBy(vendorInterestSubmissions.createdAt);
  return rows.map(rowToSubmission);
}

export async function getSubmissionById(id: string): Promise<VendorInterestSubmission | null> {
  const [row] = await db
    .select()
    .from(vendorInterestSubmissions)
    .where(eq(vendorInterestSubmissions.id, id));
  return row ? rowToSubmission(row) : null;
}

export async function createSubmission(
  data: Omit<VendorInterestSubmission, "processed" | "contactId" | "createdAt">
): Promise<VendorInterestSubmission> {
  await db.insert(vendorInterestSubmissions).values({
    id: data.id,
    businessName: data.businessName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    category: data.category,
    website: data.website,
    description: data.description,
    previousParticipant: data.previousParticipant,
    processed: false,
    contactId: null,
    createdAt: new Date(),
  });
  return (await getSubmissionById(data.id))!;
}

export async function processSubmission(
  id: string,
  contactId: string
): Promise<VendorInterestSubmission | null> {
  await db
    .update(vendorInterestSubmissions)
    .set({ processed: true, contactId })
    .where(eq(vendorInterestSubmissions.id, id));
  return getSubmissionById(id);
}
