import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllClubEvents, createClubEvent } from "@/lib/queries/events-club";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const evts = await getAllClubEvents();
    return NextResponse.json(evts);
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
    const evt = await createClubEvent({ id: generateId(), submittedBy: userId, ...body });
    return NextResponse.json(evt, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
