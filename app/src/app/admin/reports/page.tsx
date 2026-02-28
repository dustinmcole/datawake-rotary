"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import { cn } from "@/lib/utils";

// Placeholder data — will be replaced with real DB queries once member data is populated
const MEMBER_TYPE_DATA = [
  { name: "Active", value: 0, color: "#2563eb" },
  { name: "Honorary", value: 0, color: "#7c3aed" },
  { name: "Alumni", value: 0, color: "#059669" },
  { name: "Leave", value: 0, color: "#d97706" },
  { name: "Prospect", value: 0, color: "#6b7280" },
];

const ATTENDANCE_TREND = [
  { month: "Sep", rate: 0 },
  { month: "Oct", rate: 0 },
  { month: "Nov", rate: 0 },
  { month: "Dec", rate: 0 },
  { month: "Jan", rate: 0 },
  { month: "Feb", rate: 0 },
];

const EVENT_CATEGORIES = [
  { name: "Meeting", value: 0 },
  { name: "Service", value: 0 },
  { name: "Social", value: 0 },
  { name: "Fundraiser", value: 0 },
  { name: "Speaker", value: 0 },
];

interface AdminStats {
  totalMembers: number;
  attendanceRate: number;
  pendingEvents: number;
  newInquiries: number;
}

type Tab = "membership" | "attendance" | "events";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("membership");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberTypes, setMemberTypes] = useState(MEMBER_TYPE_DATA);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/members").then((r) => r.json()),
    ])
      .then(([statsData, members]) => {
        setStats(statsData.stats ?? null);

        // Build member type breakdown from actual data
        if (Array.isArray(members) && members.length > 0) {
          const counts: Record<string, number> = {};
          members.forEach((m: { memberType: string }) => {
            counts[m.memberType] = (counts[m.memberType] ?? 0) + 1;
          });
          setMemberTypes(MEMBER_TYPE_DATA.map((d) => ({
            ...d,
            value: counts[d.name.toLowerCase()] ?? 0,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
    { key: "membership", label: "Membership", icon: Users },
    { key: "attendance", label: "Attendance", icon: CheckCircle },
    { key: "events", label: "Events", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">Club membership, attendance, and event analytics</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats?.totalMembers ?? "—", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Attendance Rate", value: stats ? `${stats.attendanceRate}%` : "—", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending Events", value: stats?.pendingEvents ?? "—", icon: CalendarDays, color: "text-amber-600 bg-amber-50" },
          { label: "New Inquiries", value: stats?.newInquiries ?? "—", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", kpi.color)}>
              <kpi.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <span className="block h-7 w-16 rounded bg-gray-100 animate-pulse" /> : kpi.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Membership Tab */}
      {tab === "membership" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Membership by Type</h3>
            {stats?.totalMembers === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={memberTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => value > 0 ? `${name} (${value})` : ""}>
                    {memberTypes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Member Type Breakdown</h3>
            <div className="space-y-3">
              {memberTypes.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-sm text-gray-700 flex-1">{t.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{t.value}</span>
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: t.color,
                        width: stats?.totalMembers ? `${(t.value / stats.totalMembers) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {!stats?.totalMembers && (
              <p className="text-xs text-gray-400 mt-4">Import members to see breakdown</p>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {tab === "attendance" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Attendance Rate</h3>
            {stats?.attendanceRate === 0 ? (
              <EmptyChart message="No attendance data yet. Start recording attendance to see trends." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={ATTENDANCE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v}%`, "Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Live attendance trends will appear here</p>
            <p className="text-amber-700 mt-0.5">
              As you record weekly attendance using the Attendance Entry tool, this chart will populate with real data.
            </p>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {tab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Events by Category</h3>
            <EmptyChart message="Submit and approve events to see breakdown by category." />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Event Approval Pipeline</h3>
            <div className="space-y-3">
              {[
                { label: "Pending Approval", value: stats?.pendingEvents ?? 0, color: "bg-amber-400" },
                { label: "Approved", value: 0, color: "bg-emerald-500" },
                { label: "Cancelled", value: 0, color: "bg-gray-300" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.color)} />
                  <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <BarChart3 className="w-10 h-10 text-gray-200 mb-3" />
      <p className="text-sm text-gray-400">{message ?? "No data to display yet."}</p>
    </div>
  );
}
