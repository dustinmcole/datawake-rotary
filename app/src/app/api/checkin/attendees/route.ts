import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getActiveSession, getCheckinsByDate } from "@/lib/queries/checkin";

// Monitor polling endpoint — returns current attendee list for active session
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member", "checkin_operator"]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getActiveSession();
  if (!session) return NextResponse.json({ session: null, checkins: [], count: 0 });

  const checkins = await getCheckinsByDate(session.meetingDate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pin: _pin, ...safeSession } = session;
  return NextResponse.json({ session: safeSession, checkins, count: checkins.length });
}
