"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  rsvpUrl: string;
  isPublic: boolean;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  meeting: "Meeting", service: "Service", social: "Social",
  fundraiser: "Fundraiser", speaker: "Speaker", general: "General",
};

const CATEGORY_COLORS: Record<string, string> = {
  meeting: "bg-blue-50 text-blue-700",
  service: "bg-emerald-50 text-emerald-700",
  social: "bg-purple-50 text-purple-700",
  fundraiser: "bg-amber-50 text-amber-700",
  speaker: "bg-indigo-50 text-indigo-700",
  general: "bg-gray-100 text-gray-600",
};

function EventCard({
  event,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  approving,
}: {
  event: ClubEvent;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  approving?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[event.category] ?? "bg-gray-100 text-gray-600")}>
              {CATEGORY_LABELS[event.category] ?? event.category}
            </span>
            {event.isPublic && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Public</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 truncate">{event.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {formatDate(event.date)}
          {event.startTime && ` · ${event.startTime}`}
          {event.endTime && ` – ${event.endTime}`}
        </span>
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </span>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
      )}

      {event.status === "pending" && onApprove && onReject && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onApprove}
            disabled={approving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-1 justify-center"
          >
            {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Approve
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors flex-1 justify-center"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function EventModal({
  event,
  onClose,
  onSaved,
}: {
  event?: ClubEvent;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    date: event?.date ?? "",
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    location: event?.location ?? "",
    category: event?.category ?? "general",
    rsvpUrl: event?.rsvpUrl ?? "",
    isPublic: event?.isPublic ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.title || !form.date) { setError("Title and date are required"); return; }
    setSaving(true); setError("");
    try {
      const url = event ? `/api/admin/events/${event.id}` : "/api/admin/events";
      const method = event ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: event?.status ?? "approved" }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{event ? "Edit Event" : "New Event"}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Title *</span>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Date *</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Category</span>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Start Time</span>
                <input type="time" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">End Time</span>
                <input type="time" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Location</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Description</span>
              <textarea rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Show on public website</span>
            </label>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
          </div>
          <div className="p-5 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {event ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function EventManagementPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "cancelled">("pending");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setApprovingId(id);
    try {
      await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      load();
    } finally { setApprovingId(null); }
  }

  async function reject(id: string) {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    load();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    load();
  }

  const tabs = [
    { key: "pending" as const, label: "Pending", icon: Clock },
    { key: "approved" as const, label: "Approved", icon: CheckCircle2 },
    { key: "cancelled" as const, label: "Cancelled", icon: XCircle },
  ];

  const shown = events.filter((e) => e.status === tab);
  const pendingCount = events.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-sm text-gray-500">
            {events.length} total · {pendingCount > 0 ? `${pendingCount} pending approval` : "none pending"}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => {
          const count = events.filter((e) => e.status === key).length;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                  key === "pending" && count > 0 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"
                )}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
              <div className="h-4 rounded bg-gray-100 w-3/4" />
              <div className="h-3 rounded bg-gray-100 w-1/2" />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {tab === "pending" ? "No events pending approval." : `No ${tab} events.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((evt) => (
            <EventCard key={evt.id} event={evt}
              onApprove={tab === "pending" ? () => approve(evt.id) : undefined}
              onReject={tab === "pending" ? () => reject(evt.id) : undefined}
              onEdit={() => setEditingEvent(evt)}
              onDelete={() => deleteEvent(evt.id)}
              approving={approvingId === evt.id}
            />
          ))}
        </div>
      )}

      {showCreate && <EventModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editingEvent && <EventModal event={editingEvent} onClose={() => setEditingEvent(null)}
        onSaved={() => { load(); setEditingEvent(null); }} />}
    </div>
  );
}
