import { NextResponse } from "next/server";
import { getAllCommunityContacts } from "@/lib/queries/community-contacts";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = ["id","firstName","lastName","email","phone","company","type","status","notes","website","address","assignedTo","createdAt"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET() {
  try {
    const contacts = await getAllCommunityContacts();
    const csv = toCSV(contacts as unknown as Record<string, unknown>[]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="community-contacts-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("GET /api/community-contacts/export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
