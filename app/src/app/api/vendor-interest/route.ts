import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions, createSubmission } from "@/lib/queries/vendor-interest";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (err) {
    console.error("GET /api/vendor-interest error:", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const submission = await createSubmission({
      id: generateId(),
      businessName: body.businessName,
      contactName: body.contactName || "",
      email: body.email || "",
      phone: body.phone || "",
      category: body.category || "",
      website: body.website || "",
      description: body.description || "",
      previousParticipant: body.previousParticipant ?? false,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("POST /api/vendor-interest error:", err);
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
