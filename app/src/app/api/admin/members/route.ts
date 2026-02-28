import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllUsers, createUser } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const members = await getAllUsers();
    return NextResponse.json(members);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, company, classification, memberType, roles } = body;

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const id = generateId();
    const member = await createUser({
      id,
      clerkId: `manual_${id}`, // Will be updated when user registers
      email,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      phone: phone ?? "",
      company: company ?? "",
      classification: classification ?? "",
      memberType: memberType ?? "active",
      roles: JSON.stringify(roles ?? ["member"]),
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("Create member error:", err);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
