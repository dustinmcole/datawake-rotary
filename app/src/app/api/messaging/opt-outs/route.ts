import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { textOptOuts, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const rows = await db
      .select({
        id: textOptOuts.id,
        phone: textOptOuts.phone,
        userId: textOptOuts.userId,
        optedOutAt: textOptOuts.optedOutAt,
        optedInAt: textOptOuts.optedInAt,
        optedOutBy: textOptOuts.optedOutBy,
        active: textOptOuts.active,
        notes: textOptOuts.notes,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(textOptOuts)
      .leftJoin(users, eq(textOptOuts.userId, users.id))
      .orderBy(desc(textOptOuts.optedOutAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/messaging/opt-outs error:", err);
    return NextResponse.json({ error: "Failed to fetch opt-outs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { phone, optedOutBy, notes } = body;
    if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

    // Find user by phone
    const [matchedUser] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone));

    const existing = await db.select().from(textOptOuts).where(eq(textOptOuts.phone, phone));
    if (existing.length > 0) {
      // Reactivate opt-out
      const [updated] = await db
        .update(textOptOuts)
        .set({ active: true, optedOutAt: new Date(), optedInAt: null, optedOutBy: optedOutBy ?? "admin", notes: notes ?? "" })
        .where(eq(textOptOuts.phone, phone))
        .returning();
      return NextResponse.json(updated);
    }

    const [row] = await db
      .insert(textOptOuts)
      .values({
        id: generateId(),
        phone,
        userId: matchedUser?.id ?? null,
        optedOutBy: optedOutBy ?? "admin",
        notes: notes ?? "",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/messaging/opt-outs error:", err);
    return NextResponse.json({ error: "Failed to create opt-out" }, { status: 500 });
  }
}
