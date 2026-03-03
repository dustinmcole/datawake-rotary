import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/queries/users";
import { validate } from "@/lib/validations/api-validate";
import { updateMemberSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const member = await getUserById(id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const validated = validate(body, updateMemberSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  const updateData: Record<string, unknown> = { ...data };
  if (Array.isArray(data.roles)) updateData.roles = JSON.stringify(data.roles);
  try {
    const updated = await updateUser(id, updateData);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update member error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isSuperAdmin = await hasAnyRole(userId, ["super_admin"]);
  if (!isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete member error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
