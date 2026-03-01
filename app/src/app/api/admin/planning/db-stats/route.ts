import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

const TABLE_NAMES = [
  "contacts", "activities", "meetings", "action_items", "tasks",
  "budget_items", "vendor_interest_submissions", "event_config",
  "users", "committees", "committee_memberships", "events",
  "event_rsvps", "attendance", "announcements", "pages",
  "page_versions", "chat_threads", "chat_messages", "membership_inquiries",
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSuperAdmin = await hasRole(userId, "super_admin");
  if (!isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stats: Record<string, number> = {};
  let totalRows = 0;

  for (const table of TABLE_NAMES) {
    try {
      const result = await db.execute(sql.raw(`SELECT count(*)::int as count FROM "${table}"`));
      const count = (result.rows?.[0] as { count: number })?.count ?? 0;
      stats[table] = count;
      totalRows += count;
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      stats[table] = -1;
    }
  }

  return NextResponse.json({
    tables: stats,
    totalTables: TABLE_NAMES.length,
    totalRows,
    timestamp: new Date().toISOString(),
  });
}
