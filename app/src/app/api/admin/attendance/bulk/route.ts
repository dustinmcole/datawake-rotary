import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { attendance } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    // date: 'YYYY-MM-DD', attendees: string[] (user IDs), type: 'regular' | 'makeup'
    const { date, attendees, type = "regular" } = body;

    if (!date || !Array.isArray(attendees)) {
      return NextResponse.json({ error: "date and attendees required" }, { status: 400 });
    }

    const records = attendees.map((uid: string) => ({
      id: generateId(),
      userId: uid,
      date,
      type,
      recordedBy: userId,
      notes: "",
    }));

    if (records.length === 0) {
      return NextResponse.json({ inserted: 0 });
    }

    // Upsert — ignore conflicts (same user/date/type)
    await db
      .insert(attendance)
      .values(records)
      .onConflictDoUpdate({
        target: [attendance.userId, attendance.date, attendance.type],
        set: { recordedBy: sql`excluded.recorded_by` },
      });

    return NextResponse.json({ inserted: records.length });
  } catch (err) {
    console.error("Bulk attendance error:", err);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
