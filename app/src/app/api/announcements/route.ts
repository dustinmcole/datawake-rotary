import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPublishedAnnouncements } from "@/lib/queries/announcements";

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await getPublishedAnnouncements();
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/announcements error:", err);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
