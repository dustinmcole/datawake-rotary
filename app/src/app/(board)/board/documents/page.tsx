"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, FileText, ExternalLink } from "lucide-react";
type D = { id: string; title: string; category: string; description: string; fileUrl: string; version: string; effectiveDate: string | null; tags: string; };
const CATS = ["bylaws","policies","standing_rules","forms","minutes","other"];
const CC: Record<string, string> = { bylaws: "bg-blue-100 text-blue-700", policies: "bg-purple-100 text-purple-700", standing_rules: "bg-indigo-100 text-indigo-700", forms: "bg-orange-100 text-orange-700", minutes: "bg-green-100 text-green-700", other: "bg-gray-100 text-gray-600" };
export default function DocumentsPage() {
  const [items, setItems] = useState<D[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<D | null>(null);
  const [cat, setCat] = useState("all");
  const ef = { title: "", category: "bylaws", description: "", fileUrl: "", version: "1.0", effectiveDate: "", tags: "" };
  const [f, setF] = useState(ef);
  const load = useCallback(async () => { setLoading(true); try { setItems(await (await fetch("/api/board/documents")).json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const openEdit = (d: D) => { setEdit(d); let t = ""; try { const a = JSON.parse(d.tags); t = Array.isArray(a) ? a.join(", ") : d.tags; } catch { t = d.tags; } setF({ title: d.title, category: d.category, description: d.description, fileUrl: d.fileUrl, version: d.version, effectiveDate: d.effectiveDate ?? "", tags: t }); setShow(true); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); const body = { ...f, tags: JSON.stringify(f.tags.split(",").map((s) => s.trim()).filter(Boolean)), effectiveDate: f.effectiveDate || null }; await fetch(edit ? `/api/board/documents/${edit.id}` : "/api/board/documents", { method: edit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); setShow(false); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/board/documents/${id}`, { method: "DELETE" }); load(); };
  const filtered = cat === "all" ? items : items.filter((i) => i.category === cat);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Document Library</h1><p className="text-sm text-gray-500">Bylaws, policies, standing rules, and forms</p></div>
        <button onClick={() => { setEdit(null); setF(ef); setShow(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" />Add Document</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCat("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${cat === "all" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>All</button>
        {CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${cat === c ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{c.replace("_"," ")}</button>)}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="font-semibold">{edit ? "Edit Document" : "Add Document"}</h2><button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c} value={c}>{c.replace("_"," ")}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Version</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">File URL</label><input type="url" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.fileUrl} onChange={(e) => setF({ ...f, fileUrl: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Effective Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.effectiveDate} onChange={(e) => setF({ ...f, effectiveDate: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-gray-400">Loading…</div> : filtered.length === 0 ? <div className="text-center py-12 text-gray-400">No documents.</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-gray-500" /></div><div className="min-w-0 flex-1"><div className="font-medium text-gray-900 text-sm leading-tight">{d.title}</div><div className="flex items-center gap-2 mt-1"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CC[d.category] ?? "bg-gray-100 text-gray-600"}`}>{d.category.replace("_"," ")}</span><span className="text-xs text-gray-400">v{d.version}</span></div></div></div>
              {d.description && <p className="text-xs text-gray-500 line-clamp-2">{d.description}</p>}
              <div className="flex items-center justify-between mt-auto"><div className="flex gap-2"><button onClick={() => openEdit(d)} className="text-xs text-blue-600 hover:underline">Edit</button><button onClick={() => del(d.id)} className="text-xs text-red-500 hover:underline">Delete</button></div>{d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">Open <ExternalLink className="w-3 h-3" /></a>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
