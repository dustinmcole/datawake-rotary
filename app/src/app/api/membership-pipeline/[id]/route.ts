import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getProspectById,
  updateProspect,
  deleteProspect,
  createProspectActivity,
} from "@/lib/queries/membership-pipeline";
import { generateId } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canView = await hasAnyRole(userId, [
    "super_admin",
    "club_admin",
    "board_member",
  ]);
  if (!canView)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const prospect = await getProspectById(id);
    if (!prospect)
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await getProspectById(id);
    if (!existing)
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );

    const body = await req.json();

    // Track stage change
    if (body.stage && body.stage !== existing.stage) {
      await createProspectActivity({
        id: generateId(),
        prospectId: id,
        activityType: "stage_change",
        fromStage: existing.stage,
        toStage: body.stage,
        description: `Stage changed from ${existing.stage} to ${body.stage}`,
        loggedBy: userId,
      });
      body.stageUpdatedAt = new Date();
    }

    const updated = await updateProspect(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update prospect error:", err);
    return NextResponse.json(
      { error: "Failed to update prospect" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    await deleteProspect(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return NextResponse.json(
      { error: "Failed to delete prospect" },
      { status: 500 }
    );
  }
}
