import { NextRequest, NextResponse } from "next/server";
import { getAllBoardActionItems, createBoardActionItem } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    return NextResponse.json(await getAllBoardActionItems());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch action items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await createBoardActionItem({ id: generateId(), ...body });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 });
  }
}
