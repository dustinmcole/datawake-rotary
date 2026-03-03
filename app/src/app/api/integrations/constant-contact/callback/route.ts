import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/integrations/constant-contact";
import { db } from "@/lib/db/client";
import { ccConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/admin/integrations?error=unauthorized", req.url));
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.redirect(new URL("/admin/integrations?error=forbidden", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/admin/integrations?error=no_code", req.url));

  try {
    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    const existing = await db.select().from(ccConfig).where(eq(ccConfig.id, 1));
    if (existing.length > 0) {
      await db.update(ccConfig).set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        connected: true,
        updatedAt: new Date(),
      }).where(eq(ccConfig.id, 1));
    } else {
      await db.insert(ccConfig).values({
        id: 1,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        connected: true,
        syncSchedule: "manual",
        fieldMappings: "{}",
        updatedAt: new Date(),
      });
    }
    return NextResponse.redirect(new URL("/admin/integrations?connected=true", req.url));
  } catch (err) {
    console.error("CC OAuth callback error:", err);
    return NextResponse.redirect(new URL("/admin/integrations?error=token_exchange", req.url));
  }
}
