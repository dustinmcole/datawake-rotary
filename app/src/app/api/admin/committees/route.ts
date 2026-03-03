import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllCommittees, createCommittee } from "@/lib/queries/committees-club";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createCommitteeSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const items = await getAllCommittees();
    return NextResponse.json(items);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const validated = validate(body, createCommitteeSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const committee = await createCommittee({
      id: generateId(),
      name: data.name,
      description: data.description,
      category: data.category,
      chairUserId: data.chairUserId ?? null,
      active: data.active,
    });
    return NextResponse.json(committee, { status: 201 });
  } catch (err) {
    console.error("Create committee error:", err);
    return NextResponse.json({ error: "Failed to create committee" }, { status: 500 });
  }
}
