import { NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import { bulkInsertCommunityContacts } from "@/lib/queries/community-contacts";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);

    const contacts = rows
      .filter((r) => r.firstname || r.first_name || r.name)
      .map((r) => {
        const firstName = r.firstname || r.first_name || (r.name?.split(" ")[0] ?? "");
        const lastName = r.lastname || r.last_name || (r.name?.split(" ").slice(1).join(" ") ?? "");
        return {
          id: generateId(),
          firstName,
          lastName,
          email: r.email ?? "",
          phone: r.phone ?? "",
          company: r.company ?? "",
          type: (r.type ?? "guest") as string,
          status: (r.status ?? "cold") as string,
          notes: r.notes ?? "",
          website: r.website ?? "",
          address: r.address ?? "",
          assignedTo: r.assignedto || r.assigned_to || "",
        };
      });

    const inserted = await bulkInsertCommunityContacts(contacts);
    return NextResponse.json({ imported: inserted.length });
  } catch (err) {
    console.error("POST /api/community-contacts/import error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
