import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { textOptOuts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Re-opt-in (admin removes opt-out)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const [updated] = await db
      .update(textOptOuts)
      .set({ active: false, optedInAt: new Date() })
      .where(eq(textOptOuts.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/messaging/opt-outs/[id] error:", err);
    return NextResponse.json({ error: "Failed to update opt-out" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await db.delete(textOptOuts).where(eq(textOptOuts.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/messaging/opt-outs/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete opt-out" }, { status: 500 });
  }
}
