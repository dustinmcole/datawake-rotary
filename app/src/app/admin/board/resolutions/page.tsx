"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, X, Loader2, Trash2, Save, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type ResolutionStatus = "pending" | "passed" | "failed" | "tabled";

interface Resolution {
  id: string;
  boardMeetingId: string | null;
  number: string;
  title: string;
  description: string;
  status: ResolutionStatus;
  yea: number;
  nay: number;
  abstain: number;
  date: string;
}

const STATUS_STYLES: Record<ResolutionStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  passed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  tabled: "bg-gray-50 text-gray-600 border-gray-200",
};

const formDefaults = {
  number: "", title: "", description: "", status: "pending" as ResolutionStatus,
  yea: 0, nay: 0, abstain: 0, date: "", boardMeetingId: "",
};

export default function ResolutionsPage() {
  const [items, setItems] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(formDefaults);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/board/resolutions");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function openCreate() { setForm(formDefaults); setEditId(null); setShowForm(true); }
  function openEdit(r: Resolution) {
    setForm({ number: r.number, title: r.title, description: r.description, status: r.status, yea: r.yea, nay: r.nay, abstain: r.abstain, date: r.date, boardMeetingId: r.boardMeetingId ?? "" });
    setEditId(r.id); setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    if (editId) {
      await fetch(`/api/board/resolutions/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/board/resolutions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this resolution?")) return;
    await fetch(`/api/board/resolutions/${id}`, { method: "DELETE" });
    fetch_();
  }

  const n = (v: string | number) => Number(v);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="h-6 w-6 text-purple-600" /> Resolutions &amp; Voting</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record board resolutions with vote counts.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus className="h-4 w-4" /> New Resolution
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Resolution" : "New Resolution"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Resolution # (e.g. 2024-001)</label>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ResolutionStatus })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="tabled">Tabled</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["yea", "nay", "abstain"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{field}</label>
                  <input type="number" min={0} value={form[field]} onChange={(e) => setForm({ ...form, [field]: n(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Save Changes" : "Create Resolution"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No resolutions yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Yea</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Nay</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Abstain</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.number || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{r.title}</td>
                  <td className="px-4 py-3 text-gray-500">{r.date || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", STATUS_STYLES[r.status])}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{r.yea}</td>
                  <td className="px-4 py-3 text-center text-red-500 font-medium">{r.nay}</td>
                  <td className="px-4 py-3 text-center text-gray-400 font-medium">{r.abstain}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => del(r.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
