import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, processSubmission } from "@/lib/queries/vendor-interest";
import { createContact } from "@/lib/queries/contacts";
import { generateId } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const submission = await getSubmissionById(id);
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(submission);
  } catch (err) {
    console.error("GET /api/vendor-interest/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}

// PUT converts submission into a contact lead
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const submission = await getSubmissionById(id);
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (submission.processed) {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const contactId = generateId();

    await createContact({
      id: contactId,
      name: submission.contactName || submission.businessName,
      company: submission.businessName,
      email: submission.email,
      phone: submission.phone,
      type: "potential_vendor",
      status: "lead",
      tier: undefined,
      vendorCategory: submission.category as import("@/lib/types").VendorCategory | undefined,
      website: submission.website,
      address: "",
      notes: submission.description,
      activities: [
        {
          id: generateId(),
          type: "note",
          description: `Converted from vendor interest form submission. Previous participant: ${submission.previousParticipant ? "Yes" : "No"}`,
          date: new Date().toISOString(),
          createdBy: body.convertedBy || "Admin",
        },
      ],
      tags: ["vendor-interest-form"],
      years: [currentYear],
      assignedTo: "Unassigned",
      publicVisible: false,
    });

    const updated = await processSubmission(id, contactId);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/vendor-interest/[id] error:", err);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
