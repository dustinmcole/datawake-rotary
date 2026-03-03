import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/queries/users";
import { getAllClubEvents, createClubEvent } from "@/lib/queries/events-club";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createEventSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const evts = await getAllClubEvents();
    return NextResponse.json(evts);
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
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const body = await req.json();
    const validated = validate(body, createEventSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const evt = await createClubEvent({
      id: generateId(),
      submittedBy: dbUser.id,
      ...data,
      status: "pending",
      approvedBy: null,
      slug: null,
      imageUrl: null,
    });
    return NextResponse.json(evt, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
