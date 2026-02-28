import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addCommitteeMember, getCommitteeById, getUserCommittees } from "@/lib/queries/committees-club";
import { getUserByClerkId } from "@/lib/queries/users";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: committeeId } = await params;
  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const committee = await getCommitteeById(committeeId);
    if (!committee) return NextResponse.json({ error: "Committee not found" }, { status: 404 });

    // Check if already a member
    const myCommittees = await getUserCommittees(dbUser.id);
    if (myCommittees.find((c) => c.id === committeeId)) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    const membership = await addCommitteeMember(committeeId, dbUser.id, "member");
    return NextResponse.json(membership, { status: 201 });
  } catch (err) {
    console.error("POST /api/committees-club/[id]/join error:", err);
    return NextResponse.json({ error: "Failed to join committee" }, { status: 500 });
  }
}
