import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getActiveSession, createSession } from "@/lib/queries/checkin";
import { getUserByClerkId } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";

// GET — public, returns active session (without PIN for security)
export async function GET() {
  const session = await getActiveSession();
  if (!session) return NextResponse.json({ session: null });
  // Never expose PIN to the kiosk GET endpoint
  const { pin: _pin, ...safe } = session;
  return NextResponse.json({ session: safe });
}

// POST — checkin-authorized roles only, opens a new session
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member", "checkin_operator"]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { meetingDate, pin, notes } = body;
  if (!meetingDate || !pin) return NextResponse.json({ error: "meetingDate and pin required" }, { status: 400 });

  // Look up DB user to satisfy FK — null if not yet seeded
  const dbUser = await getUserByClerkId(userId).catch(() => null);

  const session = await createSession({
    id: generateId(),
    meetingDate,
    pin: String(pin),
    openedBy: dbUser?.id ?? null,
    notes: notes ?? "",
    isActive: true,
  });

  return NextResponse.json({ session });
}
