import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { env } from "@/lib/env";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSuperAdmin = await hasRole(userId, "super_admin");
  if (!isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check env vars (boolean only, never expose values)
  // These are already validated at startup by env.ts — if we reach here they're set.
  const envVars: Record<string, boolean> = {
    DATABASE_URL: !!env.DATABASE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY,
    ANTHROPIC_API_KEY: !!env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: !!env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: !!env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: !!env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: !!env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  };

  // Check DB connectivity
  let dbConnected = false;
  let dbLatency = 0;
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - start;
    dbConnected = true;
  } catch (error) {
    console.error("DB health check error:", error);
    dbConnected = false;
  }

  // Integration status
  const integrations = {
    clerk: {
      configured: envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && envVars.CLERK_SECRET_KEY,
      label: "Clerk Authentication",
    },
    neon: {
      configured: dbConnected,
      label: "Neon Database",
      latency: dbLatency,
    },
    anthropic: {
      configured: envVars.ANTHROPIC_API_KEY,
      label: "Anthropic AI",
    },
    vercel: {
      configured: !!env.VERCEL,
      label: "Vercel Deployment",
    },
  };

  return NextResponse.json({
    envVars,
    dbConnected,
    dbLatency,
    integrations,
    timestamp: new Date().toISOString(),
  });
}
