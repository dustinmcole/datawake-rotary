import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRsvp, deleteRsvp, getRsvp } from "@/lib/queries/events-club";
import { getUserByClerkId } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await getRsvp(eventId, dbUser.id);
    if (existing) return NextResponse.json(existing);

    const body = await _req.json().catch(() => ({}));

    const rsvp = await createRsvp({
      id: generateId(),
      eventId,
      userId: dbUser.id,
      status: "attending",
      mealChoice: body.mealChoice || null,
      guestCount: body.guestCount || 0,
      guestNames: body.guestNames || null,
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (err) {
    console.error("POST /api/events-club/[id]/rsvp error:", err);
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await deleteRsvp(eventId, dbUser.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events-club/[id]/rsvp error:", err);
    return NextResponse.json({ error: "Failed to remove RSVP" }, { status: 500 });
  }
}
