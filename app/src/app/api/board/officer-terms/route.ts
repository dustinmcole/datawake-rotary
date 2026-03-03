import { NextRequest, NextResponse } from "next/server";
import { getAllOfficerTerms, createOfficerTerm } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    return NextResponse.json(await getAllOfficerTerms());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch officer terms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const term = await createOfficerTerm({ id: generateId(), ...body });
    return NextResponse.json(term, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create officer term" }, { status: 500 });
  }
}
