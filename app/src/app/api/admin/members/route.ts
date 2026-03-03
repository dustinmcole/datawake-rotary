import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllUsers, createUser } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createMemberSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const members = await getAllUsers();
    return NextResponse.json(members);
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
    const validated = validate(body, createMemberSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const id = generateId();
    const member = await createUser({
      id,
      clerkId: `manual_${id}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company,
      classification: data.classification,
      memberType: data.memberType,
      roles: JSON.stringify(data.roles),
    });
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("Create member error:", err);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
