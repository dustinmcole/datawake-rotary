import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getCommitteeById,
  getCommitteeWithMembers,
  updateCommittee,
  addCommitteeMember,
  removeCommitteeMember,
} from "@/lib/queries/committees-club";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const url = new URL(req.url);
  const withMembers = url.searchParams.get("members") === "true";

  const committee = withMembers
    ? await getCommitteeWithMembers(id)
    : await getCommitteeById(id);

  if (!committee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(committee);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    // Add member action
    if (body.action === "add_member") {
      const membership = await addCommitteeMember(id, body.userId, body.role ?? "member");
      return NextResponse.json(membership);
    }
    // Remove member action
    if (body.action === "remove_member") {
      await removeCommitteeMember(id, body.userId);
      return NextResponse.json({ success: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action: _action, ...data } = body;
    const updated = await updateCommittee(id, data);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update committee error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
