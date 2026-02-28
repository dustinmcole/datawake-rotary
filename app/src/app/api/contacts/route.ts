import { NextRequest, NextResponse } from "next/server";
import { getAllContacts, getContactsByType, createContact } from "@/lib/queries/contacts";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");
    const publicOnly = req.nextUrl.searchParams.get("public") === "true";

    let contacts;
    if (type) {
      const types = type.split(",");
      if (publicOnly) {
        const { getPublicContacts } = await import("@/lib/queries/contacts");
        contacts = await getPublicContacts(types);
      } else {
        contacts = await getContactsByType(types);
      }
    } else {
      contacts = await getAllContacts();
    }

    return NextResponse.json(contacts);
  } catch (err) {
    console.error("GET /api/contacts error:", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact = await createContact({
      ...body,
      id: body.id || generateId(),
      activities: body.activities || [],
      tags: body.tags || [],
      years: body.years || [],
      publicVisible: body.publicVisible ?? false,
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    console.error("POST /api/contacts error:", err);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
