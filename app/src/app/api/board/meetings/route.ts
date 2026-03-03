import { NextRequest, NextResponse } from "next/server";
import { getAllBoardMeetings, createBoardMeeting } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const meetings = await getAllBoardMeetings();
    return NextResponse.json(meetings);
  } catch (err) {
    console.error("GET /api/board/meetings error:", err);
    return NextResponse.json({ error: "Failed to fetch board meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const meeting = await createBoardMeeting({ id: generateId(), ...body });
    return NextResponse.json(meeting, { status: 201 });
  } catch (err) {
    console.error("POST /api/board/meetings error:", err);
    return NextResponse.json({ error: "Failed to create board meeting" }, { status: 500 });
  }
}
