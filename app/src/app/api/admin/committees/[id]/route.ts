import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import {
  getCommitteeById, getCommitteeWithMembers, updateCommittee,
  addCommitteeMember, removeCommitteeMember,
} from "@/lib/queries/committees-club";
import { validate } from "@/lib/validations/api-validate";
import { updateCommitteeSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const url = new URL(req.url);
  const withMembers = url.searchParams.get("members") === "true";
  const committee = withMembers ? await getCommitteeWithMembers(id) : await getCommitteeById(id);
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
  const validated = validate(body, updateCommitteeSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  try {
    if (data.action === "add_member") {
      if (!data.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      const membership = await addCommitteeMember(id, data.userId, data.role ?? "member");
      return NextResponse.json(membership);
    }
    if (data.action === "remove_member") {
      if (!data.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      await removeCommitteeMember(id, data.userId);
      return NextResponse.json({ success: true });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action: _a, userId: _u, role: _r, ...updateData } = data;
    const updated = await updateCommittee(id, updateData);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update committee error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
