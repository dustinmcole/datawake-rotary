import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAllInquiries,
  createInquiry,
} from "@/lib/queries/membership-inquiries";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";

// GET /api/membership-inquiries — admin only
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const inquiries = await getAllInquiries();
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST /api/membership-inquiries — public
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, classification, reason, referredBy } =
      body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      id: generateId(),
      name,
      email,
      phone: phone || "",
      company: company || "",
      classification: classification || "",
      reason: reason || "",
      referredBy: referredBy || "",
      status: "new",
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
