import { NextRequest, NextResponse } from "next/server";
import { getAllBudgetItems, createBudgetItem } from "@/lib/queries/budget";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const items = await getAllBudgetItems();
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/budget error:", err);
    return NextResponse.json({ error: "Failed to fetch budget items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await createBudgetItem({
      ...body,
      id: body.id || generateId(),
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/budget error:", err);
    return NextResponse.json({ error: "Failed to create budget item" }, { status: 500 });
  }
}
