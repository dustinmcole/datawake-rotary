"use client";

import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  CheckSquare,
  Square,
  Save,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

type Tab = "entry" | "report";

export default function AttendanceReportsPage() {
  const [tab, setTab] = useState<Tab>("entry");
  const [members, setMembers] = useState<Member[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // For report tab
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reportData, setReportData] = useState<{ userId: string; date: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingReport, setLoadingReport] = useState(false);

  const loadMembers = useCallback(() => {
    setLoadingMembers(true);
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((m: Member) => m.status === "active") : [];
        setMembers(active);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  function toggleMember(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() { setSelected(new Set(members.map((m) => m.id))); }
  function selectNone() { setSelected(new Set()); }

  async function saveAttendance() {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/admin/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, attendees: Array.from(selected), type: "regular" }),
      });
      if (!res.ok) throw new Error();
      setSaveResult("success");
      setTimeout(() => setSaveResult(null), 3000);
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  }

  // Simple report: group attendance by member
  useEffect(() => {
    if (tab !== "report") return;
    setLoadingReport(true);
    // Fetch all members and their IDs to simulate report
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then(() => {
        // Without a dedicated report endpoint, show summary note
        setReportData([]);
      })
      .catch(() => {})
      .finally(() => setLoadingReport(false));
  }, [tab]);

  const selectedCount = selected.size;
  const totalActive = members.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-sm text-gray-500">Record weekly attendance and view reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([["entry", "Bulk Entry", ClipboardList], ["report", "Reports", BarChart3]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "entry" && (
        <div className="space-y-4">
          {/* Date picker + summary */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700 mr-2">Meeting Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{selectedCount}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalActive}</span> members selected
              {totalActive > 0 && (
                <span className="text-gray-400 ml-1">
                  ({Math.round((selectedCount / totalActive) * 100)}% rate)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">All</button>
              <button onClick={selectNone} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">None</button>
              <button
                onClick={saveAttendance}
                disabled={saving || selectedCount === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>

          {/* Save feedback */}
          {saveResult === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Attendance saved for {selectedCount} members on {formatDate(date)}
            </div>
          )}
          {saveResult === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Failed to save attendance. Please try again.
            </div>
          )}

          {/* Member checklist */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {loadingMembers ? (
              <div className="divide-y divide-gray-100">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-5 h-5 rounded bg-gray-100" />
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="h-4 rounded bg-gray-100 w-40" />
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No active members found. Import members first.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((m) => {
                  const checked = selected.has(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50/40 transition-colors",
                        checked && "bg-emerald-50/40"
                      )}
                    >
                      {checked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        checked ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {(m.firstName[0] ?? "") + (m.lastName[0] ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", checked ? "text-emerald-900" : "text-gray-900")}>
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{m.email}</p>
                      </div>
                      {checked && (
                        <span className="text-xs text-emerald-600 font-medium shrink-0">✓ Present</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">Attendance Reports</h2>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Full reporting in progress</p>
              <p className="text-blue-600">
                Detailed attendance rate calculations, trend charts, and per-member reports will be available here.
                To view attendance analytics now, use the Reports page.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                <p className="text-sm text-gray-500 mt-0.5">Active Members</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">—</p>
                <p className="text-sm text-gray-500 mt-0.5">Avg Monthly Rate</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">—</p>
                <p className="text-sm text-gray-500 mt-0.5">Meetings This Month</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Member Attendance Summary</h3>
            </div>
            {loadingMembers ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No members found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                              {(m.firstName[0] ?? "") + (m.lastName[0] ?? "")}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
