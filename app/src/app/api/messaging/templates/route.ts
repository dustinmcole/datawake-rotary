import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { textTemplates, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const rows = await db.select().from(textTemplates).orderBy(desc(textTemplates.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/messaging/templates error:", err);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { name, content, category } = body;
    if (!name || !content) return NextResponse.json({ error: "name and content required" }, { status: 400 });
    const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, userId));
    const [template] = await db
      .insert(textTemplates)
      .values({ id: generateId(), name, content, category: category ?? "general", createdBy: dbUser?.id ?? null })
      .returning();
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("POST /api/messaging/templates error:", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
