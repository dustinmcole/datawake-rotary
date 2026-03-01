import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getActivitiesForProspect,
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
    const activities = await getActivitiesForProspect(id);
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(
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
    const body = await req.json();

    if (!body.activityType)
      return NextResponse.json(
        { error: "Activity type required" },
        { status: 400 }
      );

    const activity = await createProspectActivity({
      id: generateId(),
      prospectId: id,
      activityType: body.activityType,
      fromStage: body.fromStage ?? null,
      toStage: body.toStage ?? null,
      description: body.description ?? "",
      activityDate: body.activityDate ? new Date(body.activityDate) : new Date(),
      loggedBy: userId,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("Create activity error:", err);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
