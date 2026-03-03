import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getActiveSession, createSession } from "@/lib/queries/checkin";
import { getUserByClerkId } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createCheckinSessionSchema } from "@/lib/validations";

export async function GET() {
  const session = await getActiveSession();
  if (!session) return NextResponse.json({ session: null });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pin: _pin, ...safe } = session;
  return NextResponse.json({ session: safe });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const allowed = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member", "checkin_operator"]);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const validated = validate(body, createCheckinSessionSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  const dbUser = await getUserByClerkId(userId).catch(() => null);
  const session = await createSession({
    id: generateId(),
    meetingDate: data.meetingDate,
    pin: data.pin,
    openedBy: dbUser?.id ?? null,
    notes: data.notes,
    isActive: true,
  });
  return NextResponse.json({ session });
}
