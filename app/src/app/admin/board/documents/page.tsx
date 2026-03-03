"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Plus, X, Loader2, Trash2, Save, ExternalLink, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type DocCategory = "bylaws" | "policy" | "standing_rules" | "minutes" | "general";

interface BoardDocument {
  id: string;
  title: string;
  category: DocCategory;
  fileUrl: string | null;
  fileName: string;
  description: string;
  version: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<DocCategory, string> = {
  bylaws: "Bylaws",
  policy: "Policy",
  standing_rules: "Standing Rules",
  minutes: "Minutes",
  general: "General",
};

const CATEGORY_STYLES: Record<DocCategory, string> = {
  bylaws: "bg-blue-50 text-blue-700 border-blue-200",
  policy: "bg-purple-50 text-purple-700 border-purple-200",
  standing_rules: "bg-amber-50 text-amber-700 border-amber-200",
  minutes: "bg-green-50 text-green-700 border-green-200",
  general: "bg-gray-50 text-gray-600 border-gray-200",
};

const formDefaults = {
  title: "", category: "general" as DocCategory, fileUrl: "", fileName: "", description: "", version: "1.0",
};

export default function BoardDocumentsPage() {
  const [docs, setDocs] = useState<BoardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(formDefaults);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/board/documents");
    setDocs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function openCreate() { setForm(formDefaults); setEditId(null); setShowForm(true); }
  function openEdit(d: BoardDocument) {
    setForm({ title: d.title, category: d.category, fileUrl: d.fileUrl ?? "", fileName: d.fileName, description: d.description, version: d.version });
    setEditId(d.id); setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, fileUrl: form.fileUrl || null };
    if (editId) {
      await fetch(`/api/board/documents/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/board/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/board/documents/${id}`, { method: "DELETE" });
    fetch_();
  }

  const grouped: Partial<Record<DocCategory, BoardDocument[]>> = {};
  for (const d of docs) { (grouped[d.category] ??= []).push(d); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="h-6 w-6 text-rose-600" /> Document Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bylaws, policies, standing rules, and other governance documents.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {/* TODO: Vercel Blob upload not yet configured. When BLOB_READ_WRITE_TOKEN is set, replace the fileUrl text input with a proper file upload input that calls /api/board/documents/upload */}
      <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <Upload className="h-4 w-4 mt-0.5 shrink-0" />
        <span>File uploads via Vercel Blob are stubbed. Paste a URL below, or configure <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> to enable direct uploads.</span>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Document" : "Add Document"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocCategory })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
              <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">File URL <span className="text-gray-400">(Vercel Blob URL or external link)</span></label>
              <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Save Changes" : "Add Document"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No documents yet.</div>
      ) : (
        <div className="space-y-6">
          {(Object.keys(CATEGORY_LABELS) as DocCategory[]).filter((k) => grouped[k]?.length).map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{CATEGORY_LABELS[cat]}</h3>
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Version</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Added</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">File</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grouped[cat]!.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{d.title}</p>
                          {d.description && <p className="text-xs text-gray-500">{d.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">v{d.version}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {d.fileUrl ? (
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <ExternalLink className="h-3 w-3" /> Open
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No file</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(d)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
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
