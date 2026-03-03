import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/queries/users";
import { db } from "@/lib/db/client";
import { attendance } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { validate } from "@/lib/validations/api-validate";
import { bulkAttendanceSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const validated = validate(body, bulkAttendanceSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const records = data.attendees.map((uid: string) => ({
      id: generateId(),
      userId: uid,
      date: data.date,
      type: data.type,
      recordedBy: dbUser.id,
      notes: "",
    }));
    await db.insert(attendance).values(records).onConflictDoUpdate({
      target: [attendance.userId, attendance.date, attendance.type],
      set: { recordedBy: sql`excluded.recorded_by` },
    });
    return NextResponse.json({ inserted: records.length });
  } catch (err) {
    console.error("Bulk attendance error:", err);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
