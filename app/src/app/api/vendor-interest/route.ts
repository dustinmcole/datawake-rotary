import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions, createSubmission } from "@/lib/queries/vendor-interest";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createVendorInterestSchema } from "@/lib/validations";

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
    const validated = validate(body, createVendorInterestSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const submission = await createSubmission({
      id: generateId(),
      businessName: data.businessName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      category: data.category,
      website: data.website,
      description: data.description,
      previousParticipant: data.previousParticipant,
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("POST /api/vendor-interest error:", err);
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
