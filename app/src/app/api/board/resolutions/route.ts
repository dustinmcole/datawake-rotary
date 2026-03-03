import { NextRequest, NextResponse } from "next/server";
import { getAllResolutions, createResolution } from "@/lib/queries/board";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    return NextResponse.json(await getAllResolutions());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch resolutions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resolution = await createResolution({ id: generateId(), ...body });
    return NextResponse.json(resolution, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create resolution" }, { status: 500 });
  }
}
