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

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Event title is required." }, { status: 400 });
    }
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const event = await createClubEvent({
      id: generateId(),
      title: body.title,
      description: body.description || "",
      date: body.date,
      startTime: body.startTime || "",
      endTime: body.endTime || "",
      location: body.location || "",
      category: body.category || "general",
      rsvpUrl: body.rsvpUrl || "",
      isPublic: body.isPublic ?? false,
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
