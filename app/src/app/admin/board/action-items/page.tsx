"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckSquare, Plus, X, Loader2, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type KanbanStatus = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

interface BoardActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: KanbanStatus;
  priority: Priority;
  dueDate: string | null;
  boardMeetingId: string | null;
}

const COLUMNS: { key: KanbanStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-gray-100" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-50" },
  { key: "done", label: "Done", color: "bg-green-50" },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-gray-50 text-gray-500 border-gray-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-red-50 text-red-600 border-red-200",
};

const formDefaults = {
  title: "", description: "", assignee: "", status: "todo" as KanbanStatus, priority: "medium" as Priority, dueDate: "",
};

export default function BoardActionItemsPage() {
  const [items, setItems] = useState<BoardActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(formDefaults);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/board/action-items");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function openCreate() { setForm(formDefaults); setEditId(null); setShowForm(true); }
  function openEdit(i: BoardActionItem) {
    setForm({ title: i.title, description: i.description, assignee: i.assignee, status: i.status, priority: i.priority, dueDate: i.dueDate ?? "" });
    setEditId(i.id); setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, dueDate: form.dueDate || null };
    if (editId) {
      await fetch(`/api/board/action-items/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/board/action-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this action item?")) return;
    await fetch(`/api/board/action-items/${id}`, { method: "DELETE" });
    fetch_();
  }

  async function moveStatus(id: string, status: KanbanStatus) {
    await fetch(`/api/board/action-items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetch_();
  }

  const byStatus = (s: KanbanStatus) => items.filter((i) => i.status === s);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CheckSquare className="h-6 w-6 text-amber-600" /> Action Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kanban board for board-level action items.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" /> New Item
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Item" : "New Action Item"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
              <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as KanbanStatus })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Save" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ key, label, color }) => (
            <div key={key} className={cn("rounded-xl border p-4 min-h-[200px]", color)}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</h3>
                <span className="text-xs text-gray-400">{byStatus(key).length}</span>
              </div>
              <div className="space-y-2">
                {byStatus(key).map((item) => (
                  <div key={item.id} className="rounded-lg border bg-white shadow-sm p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{item.title}</p>
                      <span className={cn("text-[9px] font-medium px-1 py-0.5 rounded border shrink-0 mt-0.5", PRIORITY_STYLES[item.priority])}>{item.priority}</span>
                    </div>
                    {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                    {item.assignee && <p className="text-xs text-gray-400 mt-1">→ {item.assignee}</p>}
                    {item.dueDate && <p className="text-xs text-gray-400">due {item.dueDate}</p>}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      {COLUMNS.filter((c) => c.key !== key).map((c) => (
                        <button key={c.key} onClick={() => moveStatus(item.id, c.key)}
                          className="text-[10px] text-blue-600 hover:underline">→ {c.label}</button>
                      ))}
                      <button onClick={() => openEdit(item)} className="text-[10px] text-gray-500 hover:underline ml-auto">Edit</button>
                      <button onClick={() => del(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
                {byStatus(key).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No items</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
