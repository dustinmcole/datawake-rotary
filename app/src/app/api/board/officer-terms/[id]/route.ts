import { NextRequest, NextResponse } from "next/server";
import { updateOfficerTerm, deleteOfficerTerm } from "@/lib/queries/board";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const term = await updateOfficerTerm(id, body);
    if (!term) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(term);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update officer term" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteOfficerTerm(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete officer term" }, { status: 500 });
  }
}
