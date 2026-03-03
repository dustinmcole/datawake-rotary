"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, X, ChevronDown, ChevronUp, Loader2, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type MeetingStatus = "scheduled" | "held" | "cancelled";

interface BoardMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string;
  minutes: string;
  attendees: string;
  status: MeetingStatus;
}

const STATUS_STYLES: Record<MeetingStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  held: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function parseAttendees(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

const EMPTY: typeof formDefaults = {
  title: "", date: "", time: "", location: "", agenda: "", minutes: "", attendees: "", status: "scheduled",
};

const formDefaults = {
  title: "", date: "", time: "", location: "", agenda: "", minutes: "", attendees: "",
  status: "scheduled" as MeetingStatus,
};

export default function BoardMeetingsPage() {
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(formDefaults);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/board/meetings");
    setMeetings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function openCreate() { setForm(formDefaults); setEditId(null); setShowForm(true); }
  function openEdit(m: BoardMeeting) {
    setForm({ title: m.title, date: m.date, time: m.time, location: m.location, agenda: m.agenda, minutes: m.minutes, attendees: parseAttendees(m.attendees).join(", "), status: m.status });
    setEditId(m.id); setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, attendees: JSON.stringify(form.attendees.split(",").map((s) => s.trim()).filter(Boolean)) };
    if (editId) {
      await fetch(`/api/board/meetings/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/board/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this meeting?")) return;
    await fetch(`/api/board/meetings/${id}`, { method: "DELETE" });
    fetch_();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Calendar className="h-6 w-6 text-blue-600" /> Board Meetings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule meetings, record agenda &amp; minutes, track attendees.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> New Meeting
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Meeting" : "New Meeting"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MeetingStatus })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="scheduled">Scheduled</option>
                <option value="held">Held</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Attendees (comma-separated)</label>
              <input placeholder="Jane Doe, John Smith" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Agenda</label>
              <textarea rows={4} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} placeholder="Agenda items..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Minutes</label>
              <textarea rows={5} value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} placeholder="Meeting minutes..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editId ? "Save Changes" : "Create Meeting"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No board meetings yet.</div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const attendees = parseAttendees(m.attendees);
            const expanded = expandedId === m.id;
            return (
              <div key={m.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expanded ? null : m.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{m.title}</span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", STATUS_STYLES[m.status])}>{m.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {m.date}{m.time ? ` at ${m.time}` : ""}{m.location ? ` · ${m.location}` : ""}
                      {attendees.length > 0 && ` · ${attendees.length} attendee${attendees.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(m); }} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); del(m.id); }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                {expanded && (
                  <div className="border-t px-5 py-4 space-y-3 bg-gray-50 text-sm">
                    {attendees.length > 0 && <div><span className="font-medium text-gray-700">Attendees: </span><span className="text-gray-600">{attendees.join(", ")}</span></div>}
                    {m.agenda && <div><p className="font-medium text-gray-700 mb-1">Agenda</p><pre className="whitespace-pre-wrap text-gray-600 text-xs font-sans">{m.agenda}</pre></div>}
                    {m.minutes && <div><p className="font-medium text-gray-700 mb-1">Minutes</p><pre className="whitespace-pre-wrap text-gray-600 text-xs font-sans">{m.minutes}</pre></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
