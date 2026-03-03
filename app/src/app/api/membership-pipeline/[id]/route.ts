import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getProspectById, updateProspect, deleteProspect, createProspectActivity,
} from "@/lib/queries/membership-pipeline";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { updateProspectSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canView = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const prospect = await getProspectById(id);
    if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    return NextResponse.json(prospect);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const existing = await getProspectById(id);
    if (!existing) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    const body = await req.json();
    const validated = validate(body, updateProspectSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const updateData: Record<string, unknown> = { ...data };
    if (data.stage && data.stage !== existing.stage) {
      await createProspectActivity({
        id: generateId(),
        prospectId: id,
        activityType: "stage_change",
        fromStage: existing.stage,
        toStage: data.stage,
        description: `Stage changed from ${existing.stage} to ${data.stage}`,
        loggedBy: userId,
      });
      updateData.stageUpdatedAt = new Date();
    }
    const updated = await updateProspect(id, updateData);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update prospect error:", err);
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    await deleteProspect(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
