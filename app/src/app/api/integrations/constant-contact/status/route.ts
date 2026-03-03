import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ccConfig, ccListMappings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db.select().from(ccConfig).where(eq(ccConfig.id, 1));
  const config = rows[0] ?? { connected: false, syncSchedule: "manual", fieldMappings: "{}" };
  const mappings = await db.select().from(ccListMappings);

  return NextResponse.json({
    connected: config.connected ?? false,
    syncSchedule: config.syncSchedule ?? "manual",
    fieldMappings: JSON.parse((config as { fieldMappings?: string }).fieldMappings ?? "{}"),
    mappings,
  });
}
