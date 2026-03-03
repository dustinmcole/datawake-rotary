import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ccConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { syncSchedule } = body;
  if (!["manual", "nightly", "weekly"].includes(syncSchedule)) {
    return NextResponse.json({ error: "Invalid schedule" }, { status: 400 });
  }

  const existing = await db.select().from(ccConfig).where(eq(ccConfig.id, 1));
  if (existing.length > 0) {
    await db.update(ccConfig).set({ syncSchedule, updatedAt: new Date() }).where(eq(ccConfig.id, 1));
  } else {
    await db.insert(ccConfig).values({ id: 1, syncSchedule, fieldMappings: "{}", updatedAt: new Date() });
  }
  return NextResponse.json({ ok: true });
}
