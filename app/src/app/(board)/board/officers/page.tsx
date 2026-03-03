"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, User } from "lucide-react";
type OT = { id: string; officerName: string; role: string; rotaryYear: string; startDate: string; endDate: string | null; active: boolean; notes: string; };
const ROLES = ["President","President-Elect","Vice President","Secretary","Treasurer","Sergeant-at-Arms","Public Image Chair","Foundation Chair","Service Chair","Past President","Director"];
export default function OfficersPage() {
  const [items, setItems] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<OT | null>(null);
  const [yr, setYr] = useState("all");
  const curRY = (() => { const d = new Date(); const y = d.getFullYear(); return d.getMonth() >= 6 ? `${y}-${y+1}` : `${y-1}-${y}`; })();
  const ef = { officerName: "", role: "President", rotaryYear: curRY, startDate: "", endDate: "", active: true, notes: "" };
  const [f, setF] = useState(ef);
  const load = useCallback(async () => { setLoading(true); try { setItems(await (await fetch("/api/board/officer-terms")).json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const years = Array.from(new Set(items.map((i) => i.rotaryYear))).sort().reverse();
  const openEdit = (o: OT) => { setEdit(o); setF({ officerName: o.officerName, role: o.role, rotaryYear: o.rotaryYear, startDate: o.startDate, endDate: o.endDate ?? "", active: o.active, notes: o.notes }); setShow(true); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); const body = { ...f, endDate: f.endDate || null }; await fetch(edit ? `/api/board/officer-terms/${edit.id}` : "/api/board/officer-terms", { method: edit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); setShow(false); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/board/officer-terms/${id}`, { method: "DELETE" }); load(); };
  const filtered = yr === "all" ? items : items.filter((i) => i.rotaryYear === yr);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Officers</h1><p className="text-sm text-gray-500">Officer terms and governance calendar</p></div>
        <button onClick={() => { setEdit(null); setF(ef); setShow(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" />Add Officer</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setYr("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${yr === "all" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>All Years</button>
        {years.map((y) => <button key={y} onClick={() => setYr(y)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${yr === y ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{y}</button>)}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="font-semibold">{edit ? "Edit Officer" : "Add Officer"}</h2><button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Name *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={f.officerName} onChange={(e) => setF({ ...f, officerName: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Role</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Rotary Year</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.rotaryYear} onChange={(e) => setF({ ...f, rotaryYear: e.target.value })} placeholder="2025-2026" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">End Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
                <div className="col-span-2 flex items-center gap-2"><input type="checkbox" id="act" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /><label htmlFor="act" className="text-sm">Currently active</label></div>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-gray-400">Loading…</div> : (
        <div className="space-y-6">
          {filtered.filter((i) => i.active).length > 0 && (
            <div><h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Current Officers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.filter((i) => i.active).map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3"><div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-blue-600" /></div><div><div className="font-medium text-gray-900 text-sm">{o.officerName}</div><div className="text-xs text-blue-600 font-medium">{o.role}</div><div className="text-xs text-gray-400">{o.rotaryYear}</div></div></div>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100"><button onClick={() => openEdit(o)} className="text-xs text-blue-600 hover:underline">Edit</button><button onClick={() => del(o.id)} className="text-xs text-red-500 hover:underline">Delete</button></div>
                </div>
              ))}
            </div></div>
          )}
          {filtered.filter((i) => !i.active).length > 0 && (
            <div><h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past Officers</h2>
            <div className="space-y-2">
              {filtered.filter((i) => !i.active).map((o) => (
                <div key={o.id} className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-gray-700">{o.officerName} <span className="text-xs text-gray-400">· {o.role} · {o.rotaryYear}</span></span>
                  <div className="flex gap-2"><button onClick={() => openEdit(o)} className="text-xs text-blue-600 hover:underline">Edit</button><button onClick={() => del(o.id)} className="text-xs text-red-500 hover:underline">Delete</button></div>
                </div>
              ))}
            </div></div>
          )}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No officers for this selection.</div>}
        </div>
      )}
    </div>
  );
}
