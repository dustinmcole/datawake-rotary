import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ccListMappings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const mappings = await db.select().from(ccListMappings);
  return NextResponse.json(mappings);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { segment, ccListId, ccListName } = body;
  if (!segment) return NextResponse.json({ error: "segment required" }, { status: 400 });

  const existing = await db.select().from(ccListMappings).where(eq(ccListMappings.segment, segment));
  if (existing.length > 0) {
    const updated = await db.update(ccListMappings).set({
      ccListId: ccListId ?? "",
      ccListName: ccListName ?? "",
      enabled: body.enabled ?? true,
      updatedAt: new Date(),
    }).where(eq(ccListMappings.segment, segment)).returning();
    return NextResponse.json(updated[0]);
  } else {
    const created = await db.insert(ccListMappings).values({
      id: generateId(),
      segment,
      ccListId: ccListId ?? "",
      ccListName: ccListName ?? "",
      enabled: body.enabled ?? true,
      updatedAt: new Date(),
    }).returning();
    return NextResponse.json(created[0], { status: 201 });
  }
}
