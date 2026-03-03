import { NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import {
  getAllCommunityContacts,
  createCommunityContact,
  updateCommunityContact,
  deleteCommunityContact,
} from "@/lib/queries/community-contacts";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") ?? undefined;
    const type = req.nextUrl.searchParams.get("type") ?? undefined;
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const contacts = await getAllCommunityContacts({ search, type, status });
    return NextResponse.json(contacts);
  } catch (err) {
    console.error("GET /api/community-contacts error:", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, company, type, status, notes, website, address, assignedTo } = body;
    if (!firstName || !lastName || !type) {
      return NextResponse.json({ error: "firstName, lastName, and type are required" }, { status: 400 });
    }
    const contact = await createCommunityContact({
      id: generateId(),
      firstName,
      lastName,
      email: email ?? "",
      phone: phone ?? "",
      company: company ?? "",
      type,
      status: status ?? "cold",
      notes: notes ?? "",
      website: website ?? "",
      address: address ?? "",
      assignedTo: assignedTo ?? "",
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    console.error("POST /api/community-contacts error:", err);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const contact = await updateCommunityContact(id, data);
    return NextResponse.json(contact);
  } catch (err) {
    console.error("PATCH /api/community-contacts error:", err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteCommunityContact(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/community-contacts error:", err);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
