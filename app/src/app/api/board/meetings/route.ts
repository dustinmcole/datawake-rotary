import { NextRequest, NextResponse } from "next/server";
import { getAllBoardMeetings, createBoardMeeting } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    return NextResponse.json(await getAllBoardMeetings());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(await createBoardMeeting({ id: generateId(), ...body }), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
