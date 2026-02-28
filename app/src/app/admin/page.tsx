"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Inbox,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Megaphone,
  UserPlus,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface AdminStats {
  totalMembers: number;
  pendingEvents: number;
  newInquiries: number;
  attendanceRate: number;
  uniqueAttendeesThisMonth: number;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<RecentAnnouncement[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats ?? null);
        setRecentAnnouncements(data.recentAnnouncements ?? []);
        setRecentMembers(data.recentMembers ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    {
      label: "Active Members",
      value: stats?.totalMembers ?? "—",
      sub: "registered in platform",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/admin/members",
    },
    {
      label: "Attendance Rate",
      value: stats ? `${stats.attendanceRate}%` : "—",
      sub: `${stats?.uniqueAttendeesThisMonth ?? 0} attended this month`,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/attendance",
    },
    {
      label: "Pending Events",
      value: stats?.pendingEvents ?? "—",
      sub: "awaiting approval",
      icon: CalendarDays,
      color: stats?.pendingEvents ? "from-amber-500 to-amber-600" : "from-gray-400 to-gray-500",
      href: "/admin/events",
    },
    {
      label: "New Inquiries",
      value: stats?.newInquiries ?? "—",
      sub: "membership inquiries",
      icon: Inbox,
      color: stats?.newInquiries ? "from-rose-500 to-rose-600" : "from-gray-400 to-gray-500",
      href: "/admin/members",
    },
  ];

  const quickActions = [
    { label: "Invite Member", desc: "Send a Clerk invitation via email", icon: UserPlus, href: "/admin/members", color: "from-blue-500 to-blue-600" },
    { label: "New Announcement", desc: "Post a club announcement", icon: Megaphone, href: "/admin/announcements", color: "from-purple-500 to-purple-600" },
    { label: "Attendance Entry", desc: "Record this week's attendance", icon: CheckCircle, href: "/admin/attendance", color: "from-emerald-500 to-emerald-600" },
    { label: "Review Events", desc: "Approve pending event submissions", icon: CalendarDays, href: "/admin/events", color: "from-amber-500 to-amber-600" },
    { label: "Member Reports", desc: "View membership and attendance trends", icon: BarChart3, href: "/admin/reports", color: "from-indigo-500 to-indigo-600" },
    { label: "Admin Settings", desc: "Club information and integrations", icon: ShieldCheck, href: "/admin/settings", color: "from-gray-500 to-gray-600" },
  ];

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
          <Link key={card.label} href={card.href} className="group rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                <card.icon className="w-[18px] h-[18px] text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-1" />
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

      {/* Quick Actions + Recent Activity */}
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
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
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

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent Members</h2>
              <Link href="/admin/members" className="text-xs text-blue-600 hover:underline">View all</Link>
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
                      <div className="shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                          {m.memberType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent Announcements</h2>
              <Link href="/admin/announcements" className="text-xs text-blue-600 hover:underline">View all</Link>
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                        a.category === "urgent" ? "bg-red-50 text-red-700" :
                        a.category === "event" ? "bg-blue-50 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
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

      {/* Trends teaser */}
      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Membership & Attendance Trends</h2>
              <p className="text-sm text-gray-400">Full reports with Recharts visualizations</p>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-semibold transition-colors"
          >
            View Reports
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
