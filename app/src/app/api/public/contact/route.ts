import { NextRequest, NextResponse } from "next/server";
import { createContact } from "@/lib/queries/contacts";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await createContact({
      id: generateId(),
      name,
      email,
      company: "",
      phone: "",
      type: "potential_sponsor",
      status: "lead",
      website: "",
      address: "",
      notes: `Subject: ${subject || "General"}\n\n${message}`,
      activities: [],
      tags: ["website-inquiry"],
      years: [],
      assignedTo: "",
      publicVisible: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/public/contact error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
