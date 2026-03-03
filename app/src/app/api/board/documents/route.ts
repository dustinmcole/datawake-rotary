import { NextRequest, NextResponse } from "next/server";
import { getAllBoardDocuments, createBoardDocument } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    return NextResponse.json(await getAllBoardDocuments());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = await createBoardDocument({ id: generateId(), ...body });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
