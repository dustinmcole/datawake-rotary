import { NextRequest, NextResponse } from "next/server";
import { getEventConfig, updateEventConfig } from "@/lib/queries/event-config";

export async function GET() {
  try {
    const config = await getEventConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error("GET /api/event-config error:", err);
    return NextResponse.json({ error: "Failed to fetch event config" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await updateEventConfig(body);
    return NextResponse.json(config);
  } catch (err) {
    console.error("PUT /api/event-config error:", err);
    return NextResponse.json({ error: "Failed to update event config" }, { status: 500 });
  }
}
