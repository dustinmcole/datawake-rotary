import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getActiveSession, getExistingCheckin } from "@/lib/queries/checkin";
import { createAttendance } from "@/lib/queries/attendance";
import { getAllMembers, getUserByClerkId } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { checkinSchema } from "@/lib/validations";

const CHECKIN_ROLES = ["super_admin", "club_admin", "board_member", "checkin_operator"] as const;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, [...CHECKIN_ROLES]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const session = await getActiveSession();
  if (!session) return NextResponse.json({ error: "No active session" }, { status: 404 });
  const members = await getAllMembers();
  const q = query.toLowerCase().trim();
  const filtered =
    q.length < 2
      ? []
      : members
          .filter((m) => {
            const full = `${m.firstName} ${m.lastName}`.toLowerCase();
            return (
              full.includes(q) ||
              m.lastName.toLowerCase().startsWith(q) ||
              m.firstName.toLowerCase().startsWith(q)
            );
          })
          .slice(0, 8)
          .map((m) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            photoUrl: m.photoUrl,
            classification: m.classification,
            company: m.company,
          }));
  return NextResponse.json({ members: filtered, sessionDate: session.meetingDate });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, [...CHECKIN_ROLES]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getActiveSession();
  if (!session) return NextResponse.json({ error: "No active session" }, { status: 404 });
  const body = await request.json();
  const validated = validate(body, checkinSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  const existing = await getExistingCheckin(data.memberId, session.meetingDate);
  if (existing) return NextResponse.json({ success: true, alreadyCheckedIn: true });
  const dbUser = await getUserByClerkId(userId).catch(() => null);
  await createAttendance({
    id: generateId(),
    userId: data.memberId,
    date: session.meetingDate,
    type: "regular",
    notes: "Kiosk check-in",
    recordedBy: dbUser?.id ?? undefined,
  });
  return NextResponse.json({ success: true, alreadyCheckedIn: false });
}
