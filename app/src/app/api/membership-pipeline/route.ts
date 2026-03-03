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
import { validate } from "@/lib/validations/api-validate";
import { createProspectSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canView = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const prospects = search ? await searchProspects(search) : await getAllProspects();
    return NextResponse.json(prospects);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canEdit = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const validated = validate(body, createProspectSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const id = generateId();
    const prospect = await createProspect({
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      classification: data.classification,
      source: data.source,
      referredBy: data.referredBy ?? null,
      sponsorId: data.sponsorId ?? null,
      stage: data.stage,
      nextAction: data.nextAction,
      nextActionDue: data.nextActionDue ?? null,
      sourceInquiryId: data.sourceInquiryId ?? null,
      sourceContactId: data.sourceContactId ?? null,
      notes: data.notes,
      createdBy: userId,
    });
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
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
