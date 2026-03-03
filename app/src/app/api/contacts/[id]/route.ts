import { NextRequest, NextResponse } from "next/server";
import { getContactById, updateContact, deleteContact } from "@/lib/queries/contacts";
import { validate } from "@/lib/validations/api-validate";
import { updateContactSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contact = await getContactById(id);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  } catch (err) {
    console.error("GET /api/contacts/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validate(body, updateContactSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const contact = await updateContact(id, data);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  } catch (err) {
    console.error("PUT /api/contacts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteContact(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/contacts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
