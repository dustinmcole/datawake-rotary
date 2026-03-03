import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserById, updateUser, deleteUser, getUserByClerkId } from "@/lib/queries/users";
import { hasAnyRole } from "@/lib/auth";
import { validate } from "@/lib/validations/api-validate";
import { updateMemberSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const member = await getUserById(id);
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(member);
  } catch (err) {
    console.error("GET /api/members/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const dbUser = await getUserByClerkId(userId);
  const isOwnProfile = dbUser?.id === id;
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isOwnProfile && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    if (!isAdmin) {
      delete body.roles;
      delete body.memberType;
      delete body.status;
    }
    const validated = validate(body, updateMemberSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (Array.isArray(data.roles)) updateData.roles = JSON.stringify(data.roles);
    const updated = await updateUser(id, updateData);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/members/[id] error:", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/members/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
