import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ccConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.update(ccConfig).set({
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    connected: false,
    updatedAt: new Date(),
  }).where(eq(ccConfig.id, 1));

  return NextResponse.json({ ok: true });
}
