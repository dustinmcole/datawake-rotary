"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  CalendarDays,
  Inbox,
  Database,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  stats: {
    totalMembers: number;
    pendingEvents: number;
    newInquiries: number;
    attendanceRate: number;
  };
}

interface DbStats {
  tables: Record<string, number>;
  totalTables: number;
  totalRows: number;
  timestamp: string;
}

// First 8 tables in the list are Uncorked-related
const UNCORKED_TABLES = new Set([
  "contacts", "activities", "meetings", "action_items", "tasks",
  "budget_items", "vendor_interest_submissions", "event_config",
]);

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-32" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-16" /></td>
    </tr>
  );
}

const kpiConfig = [
  {
    key: "totalMembers" as const,
    label: "Total Members",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    format: (v: number) => String(v),
  },
  {
    key: "attendanceRate" as const,
    label: "Attendance Rate",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    format: (v: number) => `${v}%`,
  },
  {
    key: "pendingEvents" as const,
    label: "Pending Events",
    icon: CalendarDays,
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-700",
    format: (v: number) => String(v),
  },
  {
    key: "newInquiries" as const,
    label: "New Inquiries",
    icon: Inbox,
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-50",
    text: "text-rose-700",
    format: (v: number) => String(v),
  },
];

export default function PlatformAnalyticsTab() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [loadingDb, setLoadingDb] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setLoadingAdmin(true);
    setLoadingDb(true);

    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => setAdminStats(d as AdminStats))
      .catch(() => setAdminStats(null))
      .finally(() => setLoadingAdmin(false));

    fetch("/api/admin/planning/db-stats")
      .then((res) => res.json())
      .then((d) => setDbStats(d as DbStats))
      .catch(() => setDbStats(null))
      .finally(() => setLoadingDb(false));
  };

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => setAdminStats(d as AdminStats))
      .catch(() => setAdminStats(null))
      .finally(() => setLoadingAdmin(false));

    fetch("/api/admin/planning/db-stats")
      .then((res) => res.json())
      .then((d) => setDbStats(d as DbStats))
      .catch(() => setDbStats(null))
      .finally(() => setLoadingDb(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Platform KPIs
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5",
                refreshing && "animate-spin"
              )}
            />
            Refresh
          </button>
        </div>

        {loadingAdmin ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : adminStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiConfig.map((kpi) => {
              const Icon = kpi.icon;
              const value = adminStats.stats[kpi.key];
              return (
                <div
                  key={kpi.key}
                  className="rounded-xl bg-white border border-gray-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        kpi.bg
                      )}
                    >
                      <Icon className={cn("w-5 h-5", kpi.text)} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpi.format(value)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
            Failed to load admin stats.
          </div>
        )}
      </section>

      {/* Database Table Rows */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Database Table Rows
          </h3>
        </div>

        {loadingDb ? (
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Table Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rows</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : dbStats ? (
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Table Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Rows
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(dbStats.tables).map(([table, count], i) => {
                    const isUncorked = UNCORKED_TABLES.has(table);
                    const hasData = count > 0;
                    const isError = count === -1;
                    return (
                      <tr
                        key={table}
                        className={cn(
                          i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                        )}
                      >
                        <td className="px-4 py-2.5">
                          <code
                            className={cn(
                              "text-sm font-mono px-2 py-0.5 rounded",
                              hasData
                                ? "bg-gray-100 text-gray-700"
                                : "bg-gray-50 text-gray-400"
                            )}
                          >
                            {table}
                          </code>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-sm font-medium",
                            isError
                              ? "text-red-500"
                              : hasData
                              ? "text-gray-900"
                              : "text-gray-400"
                          )}
                        >
                          {isError ? "error" : count.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                              isUncorked
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            )}
                          >
                            {isUncorked ? "Uncorked" : "Platform"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total ({dbStats.totalTables} tables)
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {dbStats.totalRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              Last updated: {new Date(dbStats.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
            Failed to load database stats.
          </div>
        )}
      </section>
    </div>
  );
}
