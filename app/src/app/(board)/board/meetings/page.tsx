"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

type M = { id: string; title: string; date: string; time: string; location: string; type: string; status: string; agenda: string; minutes: string; attendees: string; quorumMet: boolean; notes: string; };
const SC: Record<string, string> = { scheduled: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };

export default function BoardMeetingsPage() {
  const [items, setItems] = useState<M[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<M | null>(null);
  const [exp, setExp] = useState<string | null>(null);
  const ef = { title: "", date: "", time: "", location: "", type: "regular", status: "scheduled", agenda: "", minutes: "", attendees: "", quorumMet: false, notes: "" };
  const [f, setF] = useState(ef);

  const load = useCallback(async () => { setLoading(true); try { setItems(await (await fetch("/api/board/meetings")).json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (m: M) => { setEdit(m); let a = ""; try { const p = JSON.parse(m.attendees); a = Array.isArray(p) ? p.join(", ") : m.attendees; } catch { a = m.attendees; } setF({ title: m.title, date: m.date, time: m.time, location: m.location, type: m.type, status: m.status, agenda: m.agenda, minutes: m.minutes, attendees: a, quorumMet: m.quorumMet, notes: m.notes }); setShow(true); };

  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); const body = { ...f, attendees: JSON.stringify(f.attendees.split(",").map((s) => s.trim()).filter(Boolean)) }; await fetch(edit ? `/api/board/meetings/${edit.id}` : "/api/board/meetings", { method: edit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); setShow(false); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/board/meetings/${id}`, { method: "DELETE" }); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Board Meetings</h1><p className="text-sm text-gray-500">Schedule, minutes, and attendance</p></div>
        <button onClick={() => { setEdit(null); setF(ef); setShow(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" />New Meeting</button>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="font-semibold">{edit ? "Edit Meeting" : "New Meeting"}</h2><button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Date *</label><input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Time</label><input type="time" className="w-full border rounded-lg px-3 py-2 text-sm" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Location</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="regular">Regular</option><option value="special">Special</option><option value="annual">Annual</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2 text-sm" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Attendees (comma-separated)</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={f.attendees} onChange={(e) => setF({ ...f, attendees: e.target.value })} /></div>
                <div className="col-span-2 flex items-center gap-2"><input type="checkbox" id="qm" checked={f.quorumMet} onChange={(e) => setF({ ...f, quorumMet: e.target.checked })} /><label htmlFor="qm" className="text-sm">Quorum met</label></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Agenda</label><textarea rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.agenda} onChange={(e) => setF({ ...f, agenda: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Minutes</label><textarea rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-gray-400">Loading…</div> : items.length === 0 ? <div className="text-center py-12 text-gray-400">No meetings yet.</div> : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 text-center border border-gray-200 rounded-lg py-1">
                    <div className="text-xs text-gray-400">{new Date(m.date + "T12:00:00").toLocaleString("en-US", { month: "short" })}</div>
                    <div className="text-lg font-bold text-gray-900 leading-none">{new Date(m.date + "T12:00:00").getDate()}</div>
                  </div>
                  <div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-gray-900">{m.title}</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SC[m.status] ?? "bg-gray-100 text-gray-600"}`}>{m.status}</span></div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">{m.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time}</span>}{m.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>}{m.quorumMet && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" />Quorum</span>}</div></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => del(m.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  <button onClick={() => setExp(exp === m.id ? null : m.id)}>{exp === m.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>
                </div>
              </div>
              {exp === m.id && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  {m.agenda && <div><div className="text-xs font-medium text-gray-500 uppercase mb-1">Agenda</div><pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">{m.agenda}</pre></div>}
                  {m.minutes && <div><div className="text-xs font-medium text-gray-500 uppercase mb-1">Minutes</div><pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">{m.minutes}</pre></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
