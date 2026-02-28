import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClubEventById,
  updateClubEvent,
  deleteClubEvent,
  getRsvpCountForEvent,
} from "@/lib/queries/events-club";
import { hasAnyRole } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const event = await getClubEventById(id);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const rsvpCount = await getRsvpCountForEvent(id);
    return NextResponse.json({ ...event, rsvpCount });
  } catch (err) {
    console.error("GET /api/events-club/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await updateClubEvent(id, { ...body, updatedAt: new Date() });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/events-club/[id] error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await deleteClubEvent(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events-club/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
