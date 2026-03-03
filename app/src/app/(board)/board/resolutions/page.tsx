"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
type R = { id: string; number: string; title: string; description: string; date: string; status: string; votesFor: number; votesAgainst: number; votesAbstain: number; notes: string; };
const SC: Record<string, string> = { proposed: "bg-yellow-100 text-yellow-700", passed: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700", tabled: "bg-gray-100 text-gray-600", withdrawn: "bg-gray-100 text-gray-400" };
export default function ResolutionsPage() {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<R | null>(null);
  const ef = { number: "", title: "", description: "", date: new Date().toISOString().slice(0, 10), status: "proposed", votesFor: 0, votesAgainst: 0, votesAbstain: 0, notes: "" };
  const [f, setF] = useState(ef);
  const load = useCallback(async () => { setLoading(true); try { setItems(await (await fetch("/api/board/resolutions")).json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const openEdit = (r: R) => { setEdit(r); setF({ number: r.number, title: r.title, description: r.description, date: r.date, status: r.status, votesFor: r.votesFor, votesAgainst: r.votesAgainst, votesAbstain: r.votesAbstain, notes: r.notes }); setShow(true); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); await fetch(edit ? `/api/board/resolutions/${edit.id}` : "/api/board/resolutions", { method: edit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); setSaving(false); setShow(false); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/board/resolutions/${id}`, { method: "DELETE" }); load(); };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Resolutions</h1><p className="text-sm text-gray-500">Formal board resolutions and voting log</p></div>
        <button onClick={() => { setEdit(null); setF(ef); setShow(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" />New Resolution</button>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="font-semibold">{edit ? "Edit Resolution" : "New Resolution"}</h2><button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Number</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} placeholder="2025-001" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Date *</label><input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{["proposed","passed","failed","tabled","withdrawn"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="grid grid-cols-3 gap-1 col-span-2">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">For</label><input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.votesFor} onChange={(e) => setF({ ...f, votesFor: +e.target.value })} /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Against</label><input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.votesAgainst} onChange={(e) => setF({ ...f, votesAgainst: +e.target.value })} /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Abstain</label><input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.votesAbstain} onChange={(e) => setF({ ...f, votesAbstain: +e.target.value })} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-gray-400">Loading…</div> : items.length === 0 ? <div className="text-center py-12 text-gray-400">No resolutions yet.</div> : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">{r.number && <span className="text-xs font-mono text-gray-400">#{r.number}</span>}<span className="font-medium text-gray-900">{r.title}</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SC[r.status] ?? "bg-gray-100 text-gray-600"}`}>{r.status}</span></div>
                  <div className="text-xs text-gray-500 mt-1">{r.date}</div>
                  {r.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs"><span className="flex items-center gap-1 text-green-600"><ThumbsUp className="w-3 h-3" />{r.votesFor}</span><span className="flex items-center gap-1 text-red-500"><ThumbsDown className="w-3 h-3" />{r.votesAgainst}</span><span className="flex items-center gap-1 text-gray-400"><Minus className="w-3 h-3" />{r.votesAbstain}</span></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0"><button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button><button onClick={() => del(r.id)} className="text-xs text-red-500 hover:underline">Delete</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
