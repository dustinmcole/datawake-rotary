import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { textBroadcasts, users } from "@/lib/db/schema";
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
        id: textBroadcasts.id,
        title: textBroadcasts.title,
        message: textBroadcasts.message,
        status: textBroadcasts.status,
        targetGroup: textBroadcasts.targetGroup,
        targetFilter: textBroadcasts.targetFilter,
        scheduledAt: textBroadcasts.scheduledAt,
        sentAt: textBroadcasts.sentAt,
        totalRecipients: textBroadcasts.totalRecipients,
        successCount: textBroadcasts.successCount,
        failureCount: textBroadcasts.failureCount,
        templateId: textBroadcasts.templateId,
        createdBy: textBroadcasts.createdBy,
        createdAt: textBroadcasts.createdAt,
        updatedAt: textBroadcasts.updatedAt,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
      })
      .from(textBroadcasts)
      .leftJoin(users, eq(textBroadcasts.createdBy, users.id))
      .orderBy(desc(textBroadcasts.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/messaging/broadcasts error:", err);
    return NextResponse.json({ error: "Failed to fetch broadcasts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { title, message, targetGroup, targetFilter, scheduledAt, templateId } = body;
    if (!title || !message) {
      return NextResponse.json({ error: "title and message are required" }, { status: 400 });
    }

    // Get current user's DB id
    const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, userId));

    const [broadcast] = await db
      .insert(textBroadcasts)
      .values({
        id: generateId(),
        title,
        message,
        targetGroup: targetGroup ?? "all",
        targetFilter: targetFilter ? JSON.stringify(targetFilter) : "{}",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : "draft",
        createdBy: dbUser?.id ?? null,
        templateId: templateId ?? null,
      })
      .returning();

    return NextResponse.json(broadcast, { status: 201 });
  } catch (err) {
    console.error("POST /api/messaging/broadcasts error:", err);
    return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
  }
}
