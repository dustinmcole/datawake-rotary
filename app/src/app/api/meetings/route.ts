import { NextRequest, NextResponse } from "next/server";
import { getAllMeetings, createMeeting } from "@/lib/queries/meetings";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const meetings = await getAllMeetings();
    return NextResponse.json(meetings);
  } catch (err) {
    console.error("GET /api/meetings error:", err);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const meeting = await createMeeting({
      ...body,
      id: body.id || generateId(),
      attendees: body.attendees || [],
      actionItems: body.actionItems || [],
    });
    return NextResponse.json(meeting, { status: 201 });
  } catch (err) {
    console.error("POST /api/meetings error:", err);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
