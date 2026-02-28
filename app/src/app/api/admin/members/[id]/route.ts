import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/queries/users";

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

  // Allowlist fields to prevent mass assignment
  const ALLOWED_FIELDS = ["firstName", "lastName", "phone", "company", "classification", "memberType", "status", "bio", "address", "photoUrl", "roles"] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) data[key] = body[key];
  }

  // Serialize roles array to JSON string if provided
  if (Array.isArray(data.roles)) {
    data.roles = JSON.stringify(data.roles);
  }

  try {
    const updated = await updateUser(id, data);
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

  // Only super_admin can delete members
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
