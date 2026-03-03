import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { committeeMemberships, committees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db
      .select({ userId: committeeMemberships.userId, committeeName: committees.name })
      .from(committeeMemberships)
      .innerJoin(committees, eq(committeeMemberships.committeeId, committees.id));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/members/committees error:", err);
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }
}
