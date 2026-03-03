import { NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import { getContactActivities, addContactActivity } from "@/lib/queries/community-contacts";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const activities = await getContactActivities(id);
    return NextResponse.json(activities);
  } catch (err) {
    console.error("GET activities error:", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { activityType, description, loggedBy } = body;
    if (!activityType) return NextResponse.json({ error: "activityType required" }, { status: 400 });
    const activity = await addContactActivity({
      id: generateId(),
      contactId: id,
      activityType,
      description: description ?? "",
      loggedBy: loggedBy ?? "",
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("POST activity error:", err);
    return NextResponse.json({ error: "Failed to add activity" }, { status: 500 });
  }
}
