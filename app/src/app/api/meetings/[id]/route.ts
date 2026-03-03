import { NextRequest, NextResponse } from "next/server";
import { getMeetingById, updateMeeting, deleteMeeting } from "@/lib/queries/meetings";
import { validate } from "@/lib/validations/api-validate";
import { updateMeetingSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meeting = await getMeetingById(id);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(meeting);
  } catch (err) {
    console.error("GET /api/meetings/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validate(body, updateMeetingSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const meeting = await updateMeeting(id, data);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(meeting);
  } catch (err) {
    console.error("PUT /api/meetings/[id] error:", err);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteMeeting(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/meetings/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
