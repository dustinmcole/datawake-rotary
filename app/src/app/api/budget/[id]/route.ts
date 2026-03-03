import { NextRequest, NextResponse } from "next/server";
import { getBudgetItemById, updateBudgetItem, deleteBudgetItem } from "@/lib/queries/budget";
import { validate } from "@/lib/validations/api-validate";
import { updateBudgetItemSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await getBudgetItemById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("GET /api/budget/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch budget item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = validate(body, updateBudgetItemSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const item = await updateBudgetItem(id, data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("PUT /api/budget/[id] error:", err);
    return NextResponse.json({ error: "Failed to update budget item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteBudgetItem(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/budget/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}
