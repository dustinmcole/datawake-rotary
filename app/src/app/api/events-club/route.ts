import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAllClubEvents,
  getClubEventsByStatus,
  getUpcomingClubEvents,
  createClubEvent,
} from "@/lib/queries/events-club";
import { getUserByClerkId } from "@/lib/queries/users";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createEventSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const status = req.nextUrl.searchParams.get("status");
    const upcoming = req.nextUrl.searchParams.get("upcoming") === "true";
    const mine = req.nextUrl.searchParams.get("mine") === "true";
    let events;
    if (upcoming) {
      events = await getUpcomingClubEvents();
      events = events.filter((e) => e.status === "approved");
    } else if (mine) {
      const dbUser = await getUserByClerkId(userId);
      if (!dbUser) return NextResponse.json([]);
      const { getEventsSubmittedBy } = await import("@/lib/queries/events-club");
      events = await getEventsSubmittedBy(dbUser.id);
    } else if (status) {
      events = await getClubEventsByStatus(status);
    } else {
      events = await getAllClubEvents();
    }
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events-club error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const dbUser = await getUserByClerkId(userId);
    const body = await req.json();
    const validated = validate(body, createEventSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const event = await createClubEvent({
      id: generateId(),
      ...data,
      status: "pending",
      submittedBy: dbUser?.id ?? null,
      approvedBy: null,
      slug: null,
      imageUrl: null,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("POST /api/events-club error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
