import { NextRequest, NextResponse } from "next/server";
import { getEventConfig, updateEventConfig } from "@/lib/queries/event-config";
import { validate } from "@/lib/validations/api-validate";
import { updateEventConfigSchema } from "@/lib/validations";

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
    const validated = validate(body, updateEventConfigSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const config = await updateEventConfig(data);
    return NextResponse.json(config);
  } catch (err) {
    console.error("PUT /api/event-config error:", err);
    return NextResponse.json({ error: "Failed to update event config" }, { status: 500 });
  }
}
