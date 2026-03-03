import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { textBroadcasts, textBroadcastRecipients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const [broadcast] = await db.select().from(textBroadcasts).where(eq(textBroadcasts.id, id));
    if (!broadcast) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const recipients = await db
      .select()
      .from(textBroadcastRecipients)
      .where(eq(textBroadcastRecipients.broadcastId, id));
    return NextResponse.json({ ...broadcast, recipients });
  } catch (err) {
    console.error("GET /api/messaging/broadcasts/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch broadcast" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const { title, message, targetGroup, targetFilter, scheduledAt, status } = body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (targetGroup !== undefined) updateData.targetGroup = targetGroup;
    if (targetFilter !== undefined) updateData.targetFilter = JSON.stringify(targetFilter);
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (status !== undefined) updateData.status = status;
    const [updated] = await db
      .update(textBroadcasts)
      .set(updateData)
      .where(eq(textBroadcasts.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/messaging/broadcasts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update broadcast" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await db.delete(textBroadcasts).where(eq(textBroadcasts.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/messaging/broadcasts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete broadcast" }, { status: 500 });
  }
}
