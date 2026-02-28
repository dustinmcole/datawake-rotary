import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllCommittees } from "@/lib/queries/committees-club";

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const committees = await getAllCommittees();
    return NextResponse.json(committees);
  } catch (err) {
    console.error("GET /api/committees-club error:", err);
    return NextResponse.json({ error: "Failed to fetch committees" }, { status: 500 });
  }
}
