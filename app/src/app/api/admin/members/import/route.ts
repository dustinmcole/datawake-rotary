import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { createUser } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { importMembersSchema } from "@/lib/validations";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines
    .slice(1)
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
        else { current += ch; }
      }
      values.push(current.trim());
      return headers.reduce<Record<string, string>>((obj, header, i) => {
        obj[header] = values[i] ?? "";
        return obj;
      }, {});
    })
    .filter((row) => row.email || row["e-mail"]);
}

function normalizeRow(row: Record<string, string>) {
  return {
    email: row.email || row["e-mail"] || row["email address"] || "",
    firstName: row.firstname || row["first name"] || row.first || "",
    lastName: row.lastname || row["last name"] || row.last || "",
    phone: row.phone || row["phone number"] || row.mobile || "",
    company: row.company || row.employer || row.organization || "",
    classification: row.classification || row.class || "",
    memberType: row["member type"] || row.membertype || "active",
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const validated = validate(body, importMembersSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const rows = parseCSV(data.csvText);
    const normalized = rows.map(normalizeRow).filter((r) => r.email);
    if (data.preview) return NextResponse.json({ rows: normalized, count: normalized.length });
    const results = await Promise.allSettled(
      normalized.map((row) => {
        const id = generateId();
        return createUser({
          id,
          clerkId: `import_${id}`,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          company: row.company,
          classification: row.classification,
          memberType: ["active", "honorary", "alumni", "leave", "prospect"].includes(row.memberType)
            ? row.memberType : "active",
          roles: JSON.stringify(["member"]),
        });
      })
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    return NextResponse.json({ imported: succeeded, failed, total: normalized.length });
  } catch (err) {
    console.error("Import members error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
