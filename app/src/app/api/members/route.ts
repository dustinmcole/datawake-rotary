import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllMembers, createUser } from "@/lib/queries/users";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase();
    const memberType = req.nextUrl.searchParams.get("memberType");

    let members = await getAllMembers();

    if (memberType) {
      members = members.filter((m) => m.memberType === memberType);
    }

    if (search) {
      members = members.filter(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(search) ||
          m.company.toLowerCase().includes(search) ||
          m.classification.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(members);
  } catch (err) {
    console.error("GET /api/members error:", err);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const user = await createUser({
      ...body,
      id: body.id || generateId(),
      clerkId: body.clerkId || generateId(),
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("POST /api/members error:", err);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
