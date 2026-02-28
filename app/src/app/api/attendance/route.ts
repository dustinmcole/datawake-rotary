import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAttendanceByUser, createAttendance } from "@/lib/queries/attendance";
import { getUserByClerkId } from "@/lib/queries/users";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const targetUserId = req.nextUrl.searchParams.get("userId");
    const dbUser = await getUserByClerkId(userId);

    if (targetUserId && targetUserId !== dbUser?.id) {
      const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
      if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const records = await getAttendanceByUser(targetUserId);
      return NextResponse.json(records);
    }

    if (!dbUser) return NextResponse.json([]);

    const records = await getAttendanceByUser(dbUser.id);
    return NextResponse.json(records);
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Validate date format and not in future
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    const today = new Date().toISOString().split("T")[0];
    if (body.date > today) {
      return NextResponse.json({ error: "Cannot record attendance for a future date." }, { status: 400 });
    }

    const record = await createAttendance({
      id: generateId(),
      userId: dbUser.id,
      date: body.date,
      type: body.type || "regular",
      makeupClub: body.makeupClub || null,
      notes: body.notes || "",
      recordedBy: dbUser.id,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    // Handle unique constraint violation (already recorded for this date+type)
    const message = err instanceof Error && err.message.includes("unique")
      ? "Attendance already recorded for this date and type"
      : "Failed to record attendance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
