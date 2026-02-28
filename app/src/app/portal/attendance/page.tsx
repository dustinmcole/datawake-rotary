"use client";

import { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  CalendarCheck,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AttendanceRecord = {
  id: string;
  date: string;
  type: string;
  makeupClub: string | null;
  notes: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  regular: "Regular Meeting",
  makeup: "Makeup",
  online: "Online Meeting",
  service: "Service Project",
};

const TYPE_COLORS: Record<string, string> = {
  regular: "bg-blue-100 text-blue-700",
  makeup: "bg-amber-100 text-amber-700",
  online: "bg-green-100 text-green-700",
  service: "bg-purple-100 text-purple-700",
};

function getRotaryYear() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const startYear = month < 6 ? year - 1 : year;
  return { start: `${startYear}-07-01`, end: `${startYear + 1}-06-30`, label: `${startYear}–${startYear + 1}` };
}

function buildMonthlyChart(records: AttendanceRecord[], ryStart: string) {
  const months: { month: string; attended: number }[] = [];
  const startDate = new Date(ryStart + "T00:00:00");
  for (let i = 0; i < 12; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    if (d > new Date()) break;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
    const count = records.filter((r) => r.date.startsWith(monthStr)).length;
    months.push({ month: label, attended: count });
  }
  return months;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("regular");
  const [makeupClub, setMakeupClub] = useState("");
  const [notes, setNotes] = useState("");

  const rotaryYear = getRotaryYear();

  useEffect(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ryRecords = useMemo(
    () => records.filter((r) => r.date >= rotaryYear.start && r.date <= rotaryYear.end),
    [records, rotaryYear.start, rotaryYear.end]
  );

  const regular = ryRecords.filter((r) => r.type === "regular").length;
  const makeups = ryRecords.filter((r) => r.type === "makeup").length;
  const weeksElapsed = Math.max(
    1,
    Math.floor((Date.now() - new Date(rotaryYear.start).getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const rate = Math.min(100, Math.round(((regular + makeups) / weeksElapsed) * 100));

  const chartData = useMemo(() => buildMonthlyChart(ryRecords, rotaryYear.start), [ryRecords, rotaryYear.start]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, makeupClub: type === "makeup" ? makeupClub : null, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to record attendance");
        return;
      }
      setRecords((prev) => [data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setType("regular");
        setMakeupClub("");
        setNotes("");
        setDate(new Date().toISOString().split("T")[0]);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500">Rotary Year {rotaryYear.label}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Record Attendance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={`${rate}%`} label="Attendance Rate" color="text-blue-600" />
        <StatCard value={regular.toString()} label="Regular Meetings" color="text-blue-600" />
        <StatCard value={makeups.toString()} label="Makeups" color="text-amber-600" />
        <StatCard value={ryRecords.length.toString()} label="Total Entries" color="text-purple-600" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Monthly Attendance</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ fill: "#f0f6ff" }}
              />
              <Bar dataKey="attended" fill="#2563eb" radius={[4, 4, 0, 0]} name="Attended" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Attendance History</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No attendance records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          TYPE_COLORS[r.type] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {TYPE_LABELS[r.type] ?? r.type}
                      </span>
                      {r.makeupClub && (
                        <span className="ml-2 text-xs text-gray-400">{r.makeupClub}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">
                      {r.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Attendance Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Record Attendance
              </Dialog.Title>
              <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Attendance Recorded!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="regular">Regular Meeting</option>
                    <option value="makeup">Makeup</option>
                    <option value="online">Online Meeting</option>
                    <option value="service">Service Project</option>
                  </select>
                </div>

                {type === "makeup" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Club Name <span className="text-gray-400">(which club did you visit?)</span>
                    </label>
                    <input
                      type="text"
                      value={makeupClub}
                      onChange={(e) => setMakeupClub(e.target.value)}
                      placeholder="e.g., Rotary Club of Anaheim"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes…"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Saving…" : "Record"}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
