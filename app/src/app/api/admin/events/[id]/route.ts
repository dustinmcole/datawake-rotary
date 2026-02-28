import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getClubEventById, updateClubEvent, approveClubEvent, deleteClubEvent } from "@/lib/queries/events-club";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const evt = await getClubEventById(id);
  if (!evt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(evt);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    // Special action: approve
    if (body.action === "approve") {
      const evt = await approveClubEvent(id, userId);
      return NextResponse.json(evt);
    }
    // Special action: reject/cancel
    if (body.action === "reject") {
      const evt = await updateClubEvent(id, { status: "cancelled" });
      return NextResponse.json(evt);
    }
    const evt = await updateClubEvent(id, body);
    if (!evt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(evt);
  } catch (err) {
    console.error("Update event error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await deleteClubEvent(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete event error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
