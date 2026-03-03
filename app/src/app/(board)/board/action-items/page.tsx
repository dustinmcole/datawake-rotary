"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
type AI = { id: string; title: string; description: string; assignee: string; status: string; priority: string; dueDate: string | null; };
const COLS = [{ key: "todo", label: "To Do", bg: "bg-gray-100" }, { key: "in_progress", label: "In Progress", bg: "bg-blue-50" }, { key: "done", label: "Done", bg: "bg-green-50" }, { key: "cancelled", label: "Cancelled", bg: "bg-red-50" }];
const PC: Record<string, string> = { low: "text-gray-400", medium: "text-yellow-600", high: "text-red-600" };
export default function ActionItemsPage() {
  const [items, setItems] = useState<AI[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<AI | null>(null);
  const ef = { title: "", description: "", assignee: "", status: "todo", priority: "medium", dueDate: "" };
  const [f, setF] = useState(ef);
  const load = useCallback(async () => { setLoading(true); try { setItems(await (await fetch("/api/board/action-items")).json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const openEdit = (a: AI) => { setEdit(a); setF({ title: a.title, description: a.description, assignee: a.assignee, status: a.status, priority: a.priority, dueDate: a.dueDate ?? "" }); setShow(true); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); const body = { ...f, dueDate: f.dueDate || null }; await fetch(edit ? `/api/board/action-items/${edit.id}` : "/api/board/action-items", { method: edit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); setShow(false); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/board/action-items/${id}`, { method: "DELETE" }); load(); };
  const move = async (a: AI, s: string) => { await fetch(`/api/board/action-items/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) }); load(); };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Action Items</h1><p className="text-sm text-gray-500">Kanban board for board action tracking</p></div>
        <button onClick={() => { setEdit(null); setF(ef); setShow(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" />Add Item</button>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="font-semibold">{edit ? "Edit Item" : "New Action Item"}</h2><button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Priority</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{["low","medium","high"].map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-gray-400">Loading…</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLS.map((col) => {
            const ci = items.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className={`rounded-xl ${col.bg} p-3`}>
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{col.label}</span><span className="text-xs bg-white/70 rounded-full px-2 py-0.5 text-gray-600">{ci.length}</span></div>
                <div className="space-y-2">
                  {ci.map((a) => (
                    <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="text-sm font-medium text-gray-900 leading-snug">{a.title}</div>
                      {a.assignee && a.assignee !== "Unassigned" && <div className="text-xs text-gray-500 mt-1">{a.assignee}</div>}
                      <div className="flex items-center justify-between mt-2"><span className={`text-xs font-medium capitalize ${PC[a.priority] ?? "text-gray-400"}`}>{a.priority}</span>{a.dueDate && <span className="text-xs text-gray-400">{a.dueDate}</span>}</div>
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 text-xs flex-wrap">
                        <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => del(a.id)} className="text-red-500 hover:underline">Delete</button>
                        {col.key === "todo" && <button onClick={() => move(a, "in_progress")} className="text-gray-500 hover:underline ml-auto">→ Start</button>}
                        {col.key === "in_progress" && <button onClick={() => move(a, "done")} className="text-green-600 hover:underline ml-auto">→ Done</button>}
                        {col.key === "done" && <button onClick={() => move(a, "todo")} className="text-gray-400 hover:underline ml-auto">← Reopen</button>}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setEdit(null); setF({ ...ef, status: col.key }); setShow(true); }} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 border border-dashed border-gray-300 rounded-lg hover:border-gray-400">+ Add</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
