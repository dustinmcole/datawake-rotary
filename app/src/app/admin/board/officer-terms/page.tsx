"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Loader2, Trash2, Save } from "lucide-react";

interface OfficerTerm {
  id: string;
  officerName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  year: string;
  notes: string;
}

const formDefaults = {
  officerName: "", role: "", startDate: "", endDate: "", year: "", notes: "",
};

export default function OfficerTermsPage() {
  const [items, setItems] = useState<OfficerTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(formDefaults);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/board/officer-terms");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function openCreate() { setForm(formDefaults); setEditId(null); setShowForm(true); }
  function openEdit(t: OfficerTerm) {
    setForm({ officerName: t.officerName, role: t.role, startDate: t.startDate, endDate: t.endDate ?? "", year: t.year, notes: t.notes });
    setEditId(t.id); setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, endDate: form.endDate || null };
    if (editId) {
      await fetch(`/api/board/officer-terms/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/board/officer-terms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this officer term?")) return;
    await fetch(`/api/board/officer-terms/${id}`, { method: "DELETE" });
    fetch_();
  }

  // Group by year
  const grouped: Record<string, OfficerTerm[]> = {};
  for (const t of items) {
    const key = t.year || "Other";
    (grouped[key] ??= []).push(t);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="h-6 w-6 text-emerald-600" /> Officer Terms</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track officer roles and their start / end dates.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Term
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Term" : "Add Officer Term"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Officer Name *</label>
              <input required value={form.officerName} onChange={(e) => setForm({ ...form, officerName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
              <input required placeholder="President, Secretary…" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date <span className="text-gray-400">(blank = current)</span></label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year (e.g. 2024-2025)</label>
              <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Save Changes" : "Add Term"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No officer terms yet.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([year, terms]) => (
            <div key={year}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{year}</h3>
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Officer</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Start</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">End</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {terms.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.officerName}</td>
                        <td className="px-4 py-3 text-gray-700">{t.role}</td>
                        <td className="px-4 py-3 text-gray-500">{t.startDate}</td>
                        <td className="px-4 py-3 text-gray-500">{t.endDate ?? <span className="text-emerald-600 text-xs font-medium">Current</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => del(t.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
