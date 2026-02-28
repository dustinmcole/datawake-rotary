import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCommitteeWithMembers } from "@/lib/queries/committees-club";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const committee = await getCommitteeWithMembers(id);
    if (!committee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(committee);
  } catch (err) {
    console.error("GET /api/committees-club/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch committee" }, { status: 500 });
  }
}
