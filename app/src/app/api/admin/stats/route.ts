import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users, events, membershipInquiries, announcements, attendance } from "@/lib/db/schema";
import { eq, sql, gte, lte, and, desc, between } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const now = new Date();

    // Date helpers
    const todayStr = now.toISOString().split("T")[0];
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // Last month window for member trend
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      .toISOString();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString();

    // Last 12 weeks for attendance chart
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [
      totalMembers,
      pendingEvents,
      newInquiries,
      recentAnnouncements,
      recentMembers,
      monthAttendance,
      membersThisMonth,
      membersLastMonth,
      upcomingEvents,
      weeklyAttendanceRaw,
    ] = await Promise.all([
      // Total active members
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.status, "active"))
        .then((r) => r[0]?.count ?? 0),

      // Pending events awaiting approval
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(eq(events.status, "pending"))
        .then((r) => r[0]?.count ?? 0),

      // New membership inquiries (status = 'new')
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(membershipInquiries)
        .where(eq(membershipInquiries.status, "new"))
        .then((r) => r[0]?.count ?? 0),

      // Recent announcements (last 5)
      db
        .select({
          id: announcements.id,
          title: announcements.title,
          category: announcements.category,
          createdAt: announcements.createdAt,
        })
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(5),

      // Recently joined members (last 5)
      db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          memberType: users.memberType,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5),

      // Attendance records this month (to compute rate)
      db
        .select({ userId: attendance.userId })
        .from(attendance)
        .where(gte(attendance.date, firstOfMonth)),

      // Members added this month (for trend)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(gte(users.createdAt, new Date(firstOfThisMonth)))
        .then((r) => r[0]?.count ?? 0),

      // Members added last month (for trend)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(
          and(
            gte(users.createdAt, new Date(firstOfLastMonth)),
            lte(users.createdAt, new Date(endOfLastMonth))
          )
        )
        .then((r) => r[0]?.count ?? 0),

      // Upcoming approved events (next 7 days)
      db
        .select({
          id: events.id,
          title: events.title,
          date: events.date,
          startTime: events.startTime,
          location: events.location,
          category: events.category,
        })
        .from(events)
        .where(
          and(
            eq(events.status, "approved"),
            gte(events.date, todayStr),
            lte(events.date, in7Days)
          )
        )
        .orderBy(events.date)
        .limit(5),

      // Weekly attendance counts (last 12 weeks) — group by ISO week
      db
        .select({
          week: sql<string>`to_char(date_trunc('week', ${attendance.date}::date), 'YYYY-MM-DD')`,
          count: sql<number>`count(distinct ${attendance.userId})::int`,
        })
        .from(attendance)
        .where(gte(attendance.date, twelveWeeksAgo))
        .groupBy(sql`date_trunc('week', ${attendance.date}::date)`)
        .orderBy(sql`date_trunc('week', ${attendance.date}::date)`),
    ]);

    // Attendance rate: unique attendees this month / total active members
    const uniqueAttendees = new Set(monthAttendance.map((a) => a.userId)).size;
    const attendanceRate =
      totalMembers > 0 ? Math.round((uniqueAttendees / totalMembers) * 100) : 0;

    // Member trend: new members this month vs last month
    const memberTrend =
      membersLastMonth > 0
        ? Math.round(((membersThisMonth - membersLastMonth) / membersLastMonth) * 100)
        : membersThisMonth > 0
        ? 100
        : 0;

    return NextResponse.json({
      stats: {
        totalMembers,
        pendingEvents,
        newInquiries,
        attendanceRate,
        uniqueAttendeesThisMonth: uniqueAttendees,
        membersThisMonth,
        membersLastMonth,
        memberTrend,
      },
      recentAnnouncements,
      recentMembers,
      upcomingEvents,
      weeklyAttendance: weeklyAttendanceRaw,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({
      stats: {
        totalMembers: 0,
        pendingEvents: 0,
        newInquiries: 0,
        attendanceRate: 0,
        uniqueAttendeesThisMonth: 0,
        membersThisMonth: 0,
        membersLastMonth: 0,
        memberTrend: 0,
      },
      recentAnnouncements: [],
      recentMembers: [],
      upcomingEvents: [],
      weeklyAttendance: [],
    });
  }
}
