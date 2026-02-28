import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { getUserCommittees } from "@/lib/queries/committees-club";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json([]);

    const committees = await getUserCommittees(dbUser.id);
    return NextResponse.json(committees);
  } catch (err) {
    console.error("GET /api/committees-club/mine error:", err);
    return NextResponse.json({ error: "Failed to fetch committees" }, { status: 500 });
  }
}
