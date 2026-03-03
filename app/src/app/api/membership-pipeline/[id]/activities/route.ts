import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getActivitiesForProspect, createProspectActivity } from "@/lib/queries/membership-pipeline";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createProspectActivitySchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canView = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const activities = await getActivitiesForProspect(id);
    return NextResponse.json(activities);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validate(body, createProspectActivitySchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const activity = await createProspectActivity({
      id: generateId(),
      prospectId: id,
      activityType: data.activityType,
      fromStage: data.fromStage ?? null,
      toStage: data.toStage ?? null,
      description: data.description,
      activityDate: data.activityDate ? new Date(data.activityDate) : new Date(),
      loggedBy: userId,
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("Create activity error:", err);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
