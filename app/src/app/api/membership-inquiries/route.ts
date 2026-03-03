import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllInquiries, createInquiry } from "@/lib/queries/membership-inquiries";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createInquirySchema } from "@/lib/validations";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const inquiries = await getAllInquiries();
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validate(body, createInquirySchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const inquiry = await createInquiry({
      id: generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      classification: data.classification,
      reason: data.reason,
      referredBy: data.referredBy,
      status: "new",
    });
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
