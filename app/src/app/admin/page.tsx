"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Inbox,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Megaphone,
  UserPlus,
  ArrowRight,
  BarChart3,
  RefreshCw,
  Plus,
  Radio,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  totalMembers: number;
  pendingEvents: number;
  newInquiries: number;
  attendanceRate: number;
  uniqueAttendeesThisMonth: number;
  membersThisMonth: number;
  membersLastMonth: number;
  memberTrend: number;
}

interface RecentAnnouncement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

interface RecentMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberType: string;
  createdAt: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  location: string;
  category: string;
}

interface WeeklyAttendance {
  week: string;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<RecentAnnouncement[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats ?? null);
        setRecentAnnouncements(data.recentAnnouncements ?? []);
        setRecentMembers(data.recentMembers ?? []);
        setUpcomingEvents(data.upcomingEvents ?? []);
        setWeeklyAttendance(data.weeklyAttendance ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format week label as "Mon D" from YYYY-MM-DD
  const chartData = weeklyAttendance.map((w) => {
    const d = new Date(w.week + "T00:00:00");
    return {
      week: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      attendees: w.count,
    };
  });

  const memberTrend = stats?.memberTrend ?? 0;

  const statCards = [
    {
      label: "Active Members",
      value: stats?.totalMembers ?? "—",
      sub: memberTrend !== 0
        ? `${memberTrend > 0 ? "+" : ""}${memberTrend}% vs last month`
        : `${stats?.membersThisMonth ?? 0} joined this month`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/admin/members",
      trend: memberTrend,
    },
    {
      label: "Attendance Rate",
      value: stats ? `${stats.attendanceRate}%` : "—",
      sub: `${stats?.uniqueAttendeesThisMonth ?? 0} attended this month`,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/attendance",
      trend: null,
    },
    {
      label: "Pending Events",
      value: stats?.pendingEvents ?? "—",
      sub: "awaiting approval",
      icon: CalendarDays,
      color: stats?.pendingEvents ? "from-amber-500 to-amber-600" : "from-gray-400 to-gray-500",
      href: "/admin/events",
      trend: null,
    },
    {
      label: "New Inquiries",
      value: stats?.newInquiries ?? "—",
      sub: "membership inquiries",
      icon: Inbox,
      color: stats?.newInquiries ? "from-rose-500 to-rose-600" : "from-gray-400 to-gray-500",
      href: "/admin/membership-pipeline",
      trend: null,
    },
  ];

  const quickActions = [
    {
      label: "Create Event",
      desc: "Add a new club event",
      icon: Plus,
      href: "/admin/events",
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Send Broadcast",
      desc: "Message all members",
      icon: Radio,
      href: "/admin/messaging",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Add Member",
      desc: "Invite a new member via email",
      icon: UserPlus,
      href: "/admin/members",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "New Announcement",
      desc: "Post a club announcement",
      icon: Megaphone,
      href: "/admin/announcements",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Attendance Entry",
      desc: "Record this week's attendance",
      icon: CheckCircle,
      href: "/admin/attendance",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "View Reports",
      desc: "Membership and attendance trends",
      icon: BarChart3,
      href: "/admin/reports",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const categoryColors: Record<string, string> = {
    meeting: "bg-blue-50 text-blue-700",
    service: "bg-green-50 text-green-700",
    social: "bg-pink-50 text-pink-700",
    fundraiser: "bg-yellow-50 text-yellow-700",
    speaker: "bg-purple-50 text-purple-700",
    general: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Fullerton Rotary Club platform overview</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}
              >
                <card.icon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex items-center gap-1">
                {card.trend !== null && card.trend !== 0 && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      card.trend > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {card.trend > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {Math.abs(card.trend)}%
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-0.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block h-7 w-16 rounded-md bg-gray-100 animate-pulse" />
              ) : (
                card.value
              )}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Attendance Chart */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Attendance — Last 12 Weeks</h2>
            <p className="text-xs text-gray-500 mt-0.5">Unique attendees per week</p>
          </div>
          <Link
            href="/admin/attendance"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Full history <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="h-48 rounded-lg bg-gray-50 animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">
            No attendance data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
                formatter={(v: number | undefined) => [v ?? 0, "Attendees"]}
              />
              <Area
                type="monotone"
                dataKey="attendees"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#attendanceGrad)"
                dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Actions + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 p-3.5 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}
                >
                  <action.icon className="w-[18px] h-[18px] text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events (next 7 days) + Recent Announcements */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
              <Link href="/admin/events" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="divide-y divide-gray-100">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 rounded bg-gray-100 animate-pulse w-36" />
                        <div className="h-3 rounded bg-gray-100 animate-pulse w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">
                  No events in the next 7 days
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingEvents.map((ev) => {
                    const d = new Date(ev.date + "T00:00:00");
                    const dayStr = d.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-3.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-amber-600 uppercase leading-none">
                            {d.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-sm font-bold text-amber-700 leading-none">
                            {d.getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ev.startTime && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {ev.startTime}
                              </span>
                            )}
                            {ev.location && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-500 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {ev.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                            categoryColors[ev.category] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ev.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent Announcements</h2>
              <Link href="/admin/announcements" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="divide-y divide-gray-100">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 rounded bg-gray-100 animate-pulse w-40" />
                        <div className="h-3 rounded bg-gray-100 animate-pulse w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentAnnouncements.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">No announcements yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentAnnouncements.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(a.createdAt)}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                          a.category === "urgent"
                            ? "bg-red-50 text-red-700"
                            : a.category === "event"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {a.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Recently Joined Members</h2>
          <Link href="/admin/members" className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 rounded bg-gray-100 animate-pulse w-32" />
                    <div className="h-3 rounded bg-gray-100 animate-pulse w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentMembers.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No members yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {(m.firstName[0] ?? "") + (m.lastName[0] ?? "")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize shrink-0">
                    {m.memberType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
