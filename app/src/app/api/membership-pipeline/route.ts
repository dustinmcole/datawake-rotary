import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getAllProspects,
  searchProspects,
  createProspect,
  createProspectActivity,
} from "@/lib/queries/membership-pipeline";
import { generateId } from "@/lib/utils";

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const prospects = search
      ? await searchProspects(search)
      : await getAllProspects();

    return NextResponse.json(prospects);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { firstName, lastName } = body;

    if (!firstName || !lastName)
      return NextResponse.json(
        { error: "First and last name required" },
        { status: 400 }
      );

    const id = generateId();
    const prospect = await createProspect({
      id,
      firstName,
      lastName,
      email: body.email ?? "",
      phone: body.phone ?? "",
      company: body.company ?? "",
      classification: body.classification ?? "",
      source: body.source ?? "web_inquiry",
      referredBy: body.referredBy ?? null,
      sponsorId: body.sponsorId ?? null,
      stage: body.stage ?? "identified",
      nextAction: body.nextAction ?? "",
      nextActionDue: body.nextActionDue ?? null,
      sourceInquiryId: body.sourceInquiryId ?? null,
      sourceContactId: body.sourceContactId ?? null,
      notes: body.notes ?? "",
      createdBy: userId,
    });

    // Log initial activity
    await createProspectActivity({
      id: generateId(),
      prospectId: id,
      activityType: "stage_change",
      fromStage: null,
      toStage: "identified",
      description: "Prospect created",
      loggedBy: userId,
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (err) {
    console.error("Create prospect error:", err);
    return NextResponse.json(
      { error: "Failed to create prospect" },
      { status: 500 }
    );
  }
}
