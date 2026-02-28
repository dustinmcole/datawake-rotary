import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users, events, membershipInquiries, announcements, attendance } from "@/lib/db/schema";
import { eq, sql, gte, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [
      totalMembers,
      pendingEvents,
      newInquiries,
      recentAnnouncements,
      recentMembers,
      monthAttendance,
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
        .select({ id: announcements.id, title: announcements.title, category: announcements.category, createdAt: announcements.createdAt })
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(5),

      // Recently joined members (last 5)
      db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email, memberType: users.memberType, createdAt: users.createdAt })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5),

      // Attendance records this month (to compute rate)
      db
        .select({ userId: attendance.userId })
        .from(attendance)
        .where(gte(attendance.date, firstOfMonth)),
    ]);

    // Attendance rate: unique attendees this month / total active members
    const uniqueAttendees = new Set(monthAttendance.map((a) => a.userId)).size;
    const attendanceRate =
      totalMembers > 0 ? Math.round((uniqueAttendees / totalMembers) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalMembers,
        pendingEvents,
        newInquiries,
        attendanceRate,
        uniqueAttendeesThisMonth: uniqueAttendees,
      },
      recentAnnouncements,
      recentMembers,
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
      },
      recentAnnouncements: [],
      recentMembers: [],
    });
  }
}
