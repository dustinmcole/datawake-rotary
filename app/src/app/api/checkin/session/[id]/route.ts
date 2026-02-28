import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getSessionById, closeSession, getCheckinsByDate } from "@/lib/queries/checkin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member", "checkin_operator"]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getSessionById(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checkins = await getCheckinsByDate(session.meetingDate);
  return NextResponse.json({ session, checkins, count: checkins.length });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member", "checkin_operator"]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await closeSession(id);
  return NextResponse.json({ success: true });
}
