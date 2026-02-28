import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllCommittees, createCommittee } from "@/lib/queries/committees-club";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const items = await getAllCommittees();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, description, category, chairUserId } = body;

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const committee = await createCommittee({
      id: generateId(),
      name,
      description: description ?? "",
      category: category ?? "standing",
      chairUserId: chairUserId ?? null,
      active: true,
    });

    return NextResponse.json(committee, { status: 201 });
  } catch (err) {
    console.error("Create committee error:", err);
    return NextResponse.json({ error: "Failed to create committee" }, { status: 500 });
  }
}
