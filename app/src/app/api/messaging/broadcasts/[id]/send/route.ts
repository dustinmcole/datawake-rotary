import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import {
  textBroadcasts,
  textBroadcastRecipients,
  textOptOuts,
  users,
  committees,
  committeeMemberships,
  attendance,
} from "@/lib/db/schema";
import { eq, and, gte, inArray, notInArray } from "drizzle-orm";
import { generateId } from "@/lib/utils";

async function resolveRecipients(targetGroup: string, targetFilter: string) {
  const filter = JSON.parse(targetFilter || "{}");

  // Get opted-out phones
  const optOuts = await db
    .select({ phone: textOptOuts.phone })
    .from(textOptOuts)
    .where(eq(textOptOuts.active, true));
  const optedOutPhones = new Set(optOuts.map((o) => normalizePhone(o.phone)));

  let members: { id: string; firstName: string; lastName: string; phone: string }[] = [];

  if (targetGroup === "all") {
    members = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, phone: users.phone })
      .from(users)
      .where(eq(users.status, "active"));
  } else if (targetGroup.startsWith("role:")) {
    const role = targetGroup.replace("role:", "");
    const all = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, phone: users.phone, roles: users.roles })
      .from(users)
      .where(eq(users.status, "active"));
    members = all.filter((u) => {
      try {
        const roles = JSON.parse(u.roles);
        return Array.isArray(roles) && roles.includes(role);
      } catch {
        return false;
      }
    });
  } else if (targetGroup.startsWith("committee:")) {
    const committeeId = targetGroup.replace("committee:", "");
    const memberships = await db
      .select({ userId: committeeMemberships.userId })
      .from(committeeMemberships)
      .where(eq(committeeMemberships.committeeId, committeeId));
    const ids = memberships.map((m) => m.userId);
    if (ids.length > 0) {
      members = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, phone: users.phone })
        .from(users)
        .where(and(eq(users.status, "active"), inArray(users.id, ids)));
    }
  } else if (targetGroup === "attendance:recent") {
    const days = filter.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];
    const recentAttendance = await db
      .select({ userId: attendance.userId })
      .from(attendance)
      .where(gte(attendance.date, sinceStr));
    const ids = [...new Set(recentAttendance.map((a) => a.userId))];
    if (ids.length > 0) {
      members = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, phone: users.phone })
        .from(users)
        .where(and(eq(users.status, "active"), inArray(users.id, ids)));
    }
  }

  return members.filter((m) => m.phone && !optedOutPhones.has(normalizePhone(m.phone)));
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function sendSms(to: string, body: string): Promise<{ sid?: string; error?: string }> {
  // Use Twilio if configured, otherwise stub
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams({ To: to, From: fromNumber, Body: body });
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message ?? "Twilio error" };
      return { sid: data.sid };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Unknown error" };
    }
  }

  // Stub: simulate success
  console.log(`[SMS STUB] To: ${to} | Body: ${body}`);
  return { sid: `STUB_${generateId()}` };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "board_member"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  try {
    const [broadcast] = await db.select().from(textBroadcasts).where(eq(textBroadcasts.id, id));
    if (!broadcast) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (broadcast.status === "sending" || broadcast.status === "sent") {
      return NextResponse.json({ error: "Broadcast already sent or in progress" }, { status: 409 });
    }

    // Mark as sending
    await db.update(textBroadcasts).set({ status: "sending", updatedAt: new Date() }).where(eq(textBroadcasts.id, id));

    const recipients = await resolveRecipients(broadcast.targetGroup, broadcast.targetFilter);

    if (recipients.length === 0) {
      await db
        .update(textBroadcasts)
        .set({ status: "sent", sentAt: new Date(), totalRecipients: 0, updatedAt: new Date() })
        .where(eq(textBroadcasts.id, id));
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    // Insert recipient rows
    const recipientRows = recipients.map((r) => ({
      id: generateId(),
      broadcastId: id,
      userId: r.id,
      phone: r.phone,
      name: `${r.firstName} ${r.lastName}`.trim(),
      status: "pending" as const,
    }));
    await db.insert(textBroadcastRecipients).values(recipientRows);

    let successCount = 0;
    let failureCount = 0;

    for (const row of recipientRows) {
      const result = await sendSms(row.phone, broadcast.message);
      const now = new Date();
      if (result.sid && !result.error) {
        successCount++;
        await db
          .update(textBroadcastRecipients)
          .set({ status: "sent", twilioSid: result.sid, sentAt: now })
          .where(eq(textBroadcastRecipients.id, row.id));
      } else {
        failureCount++;
        await db
          .update(textBroadcastRecipients)
          .set({ status: "failed", errorMessage: result.error ?? "Unknown error" })
          .where(eq(textBroadcastRecipients.id, row.id));
      }
    }

    await db
      .update(textBroadcasts)
      .set({
        status: "sent",
        sentAt: new Date(),
        totalRecipients: recipients.length,
        successCount,
        failureCount,
        updatedAt: new Date(),
      })
      .where(eq(textBroadcasts.id, id));

    return NextResponse.json({ sent: successCount, failed: failureCount, total: recipients.length });
  } catch (err) {
    console.error("POST /api/messaging/broadcasts/[id]/send error:", err);
    await db
      .update(textBroadcasts)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(textBroadcasts.id, id));
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
