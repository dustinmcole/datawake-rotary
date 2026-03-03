import { NextRequest, NextResponse } from "next/server";
import { getResolutionById, updateResolution, deleteResolution } from "@/lib/queries/board";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res = await updateResolution(id, body);
    if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update resolution" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteResolution(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete resolution" }, { status: 500 });
  }
}
