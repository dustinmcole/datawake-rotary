import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/queries/users";
import { getClubEventById, updateClubEvent, approveClubEvent, deleteClubEvent } from "@/lib/queries/events-club";
import { validate } from "@/lib/validations/api-validate";
import { adminUpdateEventSchema } from "@/lib/validations";

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
  const validated = validate(body, adminUpdateEventSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  try {
    if (data.action === "approve") {
      const dbUser = await getUserByClerkId(userId);
      if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const evt = await approveClubEvent(id, dbUser.id);
      return NextResponse.json(evt);
    }
    if (data.action === "reject") {
      const evt = await updateClubEvent(id, { status: "cancelled" });
      return NextResponse.json(evt);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action: _action, ...updateData } = data;
    const evt = await updateClubEvent(id, updateData);
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
