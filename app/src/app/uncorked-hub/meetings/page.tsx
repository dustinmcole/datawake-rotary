"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Users,
  Tag,
  Trash2,
  X,
  Check,
  ChevronRight,
  Search,
  Clock,
  Loader2,
} from "lucide-react";
import { Meeting, ActionItem, MeetingCategory } from "@/lib/types";
import { cn, generateId, formatDate, formatDateTime } from "@/lib/utils";

// ============================================
// Constants
// ============================================

const CATEGORIES: { value: MeetingCategory; label: string; color: string; dot: string; bg: string; text: string }[] = [
  { value: "planning", label: "Planning", color: "blue", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "sponsors", label: "Sponsors", color: "amber", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  { value: "vendors", label: "Vendors", color: "purple", dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  { value: "logistics", label: "Logistics", color: "emerald", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { value: "marketing", label: "Marketing", color: "rose", dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
  { value: "general", label: "General", color: "gray", dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-700" },
];

function getCategoryStyle(category: MeetingCategory) {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[5];
}

function emptyMeeting(): Omit<Meeting, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    attendees: [],
    notes: "",
    actionItems: [],
    category: "general",
  };
}

function emptyActionItem(): ActionItem {
  return {
    id: generateId(),
    text: "",
    assignee: "",
    completed: false,
    dueDate: "",
  };
}

// ============================================
// Main Page Component
// ============================================

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<MeetingCategory | "all">("all");

  const [formData, setFormData] = useState(emptyMeeting());
  const [formAttendees, setFormAttendees] = useState("");
  const [formActionItems, setFormActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMeetings(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMeetings = meetings
    .filter((m) => {
      if (filterCategory !== "all" && m.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.notes.toLowerCase().includes(q) ||
          m.attendees.some((a) => a.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function openNewForm() {
    setEditingMeeting(null);
    setFormData(emptyMeeting());
    setFormAttendees("");
    setFormActionItems([]);
    setShowForm(true);
  }

  function openEditForm(meeting: Meeting) {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      attendees: meeting.attendees,
      notes: meeting.notes,
      actionItems: meeting.actionItems,
      category: meeting.category,
    });
    setFormAttendees(meeting.attendees.join(", "));
    setFormActionItems(meeting.actionItems.length > 0 ? [...meeting.actionItems] : []);
    setSelectedMeeting(null);
    setShowForm(true);
  }

  const handleSave = useCallback(async () => {
    const attendeesList = formAttendees.split(",").map((a) => a.trim()).filter(Boolean);
    const cleanActionItems = formActionItems.filter((ai) => ai.text.trim());
    setSaving(true);
    try {
      if (editingMeeting) {
        const updated = await fetch(`/api/meetings/${editingMeeting.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, attendees: attendeesList, actionItems: cleanActionItems }),
        }).then((r) => r.json());
        setMeetings((prev) => prev.map((m) => (m.id === editingMeeting.id ? updated : m)));
      } else {
        const created = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: generateId(), ...formData, attendees: attendeesList, actionItems: cleanActionItems }),
        }).then((r) => r.json());
        setMeetings((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingMeeting(null);
    } catch (err) {
      console.error("Failed to save meeting:", err);
    } finally {
      setSaving(false);
    }
  }, [editingMeeting, formData, formAttendees, formActionItems]);

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      setSelectedMeeting(null);
    } catch (err) {
      console.error("Failed to delete meeting:", err);
    }
  }

  async function toggleActionItem(meetingId: string, actionItemId: string) {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;
    const updatedActionItems = meeting.actionItems.map((ai) =>
      ai.id === actionItemId ? { ...ai, completed: !ai.completed } : ai
    );
    try {
      const updated = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionItems: updatedActionItems }),
      }).then((r) => r.json());
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? updated : m)));
      setSelectedMeeting(updated);
    } catch (err) {
      console.error("Failed to toggle action item:", err);
    }
  }

  function addFormActionItem() { setFormActionItems([...formActionItems, emptyActionItem()]); }
  function removeFormActionItem(id: string) { setFormActionItems(formActionItems.filter((ai) => ai.id !== id)); }
  function updateFormActionItem(id: string, field: keyof ActionItem, value: string | boolean) {
    setFormActionItems(formActionItems.map((ai) => (ai.id === id ? { ...ai, [field]: value } : ai)));
  }

  const completedActionCount = (meeting: Meeting) => meeting.actionItems.filter((ai) => ai.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-wine-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-gold-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold">Fullerton Uncorked</span>
            </div>
            <h1 className="text-3xl font-bold">Meeting Notes</h1>
            <p className="text-wine-200 text-sm mt-1">Record discussions, decisions, and action items from planning meetings.</p>
          </div>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-wine-950 font-semibold text-sm shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:from-gold-300 hover:to-gold-400 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-gold-400/10 to-transparent" />
        <div className="absolute -right-5 -bottom-14 w-64 h-64 rounded-full bg-gradient-to-br from-wine-600/20 to-transparent" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn("status-badge transition-all duration-150", filterCategory === "all" ? "bg-wine-100 text-wine-800 ring-1 ring-wine-300" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
          >All</button>
          {CATEGORIES.map((cat) => {
            const style = getCategoryStyle(cat.value);
            const isActive = filterCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(isActive ? "all" : cat.value)}
                className={cn("status-badge transition-all duration-150", isActive ? `${style.bg} ${style.text} ring-1 ring-current/20` : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meeting Cards */}
      {filteredMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wine-100 to-wine-50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-wine-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {searchQuery || filterCategory !== "all" ? "No meetings found" : "No meetings yet"}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            {searchQuery || filterCategory !== "all"
              ? "Try adjusting your search or filter."
              : "Start documenting your planning sessions."}
          </p>
          {!searchQuery && filterCategory === "all" && (
            <button onClick={openNewForm} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-800 text-white font-semibold text-sm shadow-lg hover:from-wine-600 hover:to-wine-700 transition-all">
              <Plus className="w-4 h-4" />
              Record First Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting, idx) => {
            const catStyle = getCategoryStyle(meeting.category);
            const actionTotal = meeting.actionItems.length;
            const actionDone = completedActionCount(meeting);
            return (
              <button
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className="group text-left p-5 rounded-xl bg-white border border-gray-100 card-hover animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("status-badge", catStyle.bg, catStyle.text)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", catStyle.dot)} />
                    {catStyle.label}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(meeting.date)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-wine-700 transition-colors line-clamp-2">{meeting.title}</h3>
                {meeting.notes && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{meeting.notes}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{meeting.attendees.length} {meeting.attendees.length === 1 ? "attendee" : "attendees"}</span>
                  </div>
                  {actionTotal > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>{actionDone}/{actionTotal} done</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-wine-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 modal-overlay animate-fade-in" style={{ animationDuration: "200ms" }} onClick={() => setSelectedMeeting(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in" style={{ animationDuration: "300ms" }}>
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-wine-600 to-wine-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedMeeting.title}</h2>
                  <p className="text-xs text-gray-400">{formatDateTime(selectedMeeting.date + "T" + (selectedMeeting.time || "00:00"))}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMeeting(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const catStyle = getCategoryStyle(selectedMeeting.category);
                  return (
                    <span className={cn("status-badge", catStyle.bg, catStyle.text)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", catStyle.dot)} />
                      {catStyle.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedMeeting.time || "No time set"}
                </span>
              </div>

              {selectedMeeting.attendees.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Attendees</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.attendees.map((attendee, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 text-xs font-medium text-gray-700">
                        <Users className="w-3 h-3 text-gray-400" />
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</h4>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap rounded-xl bg-cream-50 border border-cream-200 p-4 text-sm leading-relaxed">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {selectedMeeting.actionItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Action Items ({completedActionCount(selectedMeeting)}/{selectedMeeting.actionItems.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((ai) => (
                      <div key={ai.id} className={cn("flex items-start gap-3 p-3 rounded-lg border transition-all", ai.completed ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-gray-100")}>
                        <button
                          onClick={() => toggleActionItem(selectedMeeting.id, ai.id)}
                          className={cn("mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all", ai.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-wine-400")}
                        >
                          {ai.completed && <Check className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", ai.completed ? "text-gray-400 line-through" : "text-gray-800")}>{ai.text}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {ai.assignee && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {ai.assignee}
                              </span>
                            )}
                            {ai.dueDate && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(ai.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => openEditForm(selectedMeeting)} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-800 text-white font-semibold text-sm hover:from-wine-600 hover:to-wine-700 transition-all">
                  Edit Meeting
                </button>
                <button onClick={() => handleDelete(selectedMeeting.id)} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-gray-300 pt-2">
                Created {formatDateTime(selectedMeeting.createdAt)} &middot; Updated {formatDateTime(selectedMeeting.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 modal-overlay animate-fade-in" style={{ animationDuration: "200ms" }} onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col" style={{ animationDuration: "250ms" }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingMeeting ? "Edit Meeting" : "New Meeting"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Meeting Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weekly Planning Check-in"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5"><Calendar className="w-3 h-3 inline mr-1" />Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5"><Clock className="w-3 h-3 inline mr-1" />Time</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5"><Tag className="w-3 h-3 inline mr-1" />Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as MeetingCategory })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all">
                    {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5"><Users className="w-3 h-3 inline mr-1" />Attendees</label>
                <input
                  type="text"
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(e.target.value)}
                  placeholder="Comma-separated names, e.g. John, Sarah, Mike"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5"><FileText className="w-3 h-3 inline mr-1" />Meeting Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Discussion points, decisions made, important details..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-700"><Check className="w-3 h-3 inline mr-1" />Action Items</label>
                  <button type="button" onClick={addFormActionItem} className="flex items-center gap-1 text-xs font-medium text-wine-600 hover:text-wine-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" />Add Item
                  </button>
                </div>

                {formActionItems.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-400">No action items yet.</p>
                    <button type="button" onClick={addFormActionItem} className="mt-1 text-xs font-medium text-wine-600 hover:text-wine-800">Add the first one</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formActionItems.map((ai, idx) => (
                      <div key={ai.id} className="p-3 rounded-xl border border-gray-100 bg-cream-50/50 space-y-2 animate-fade-in">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-300 mt-2.5 w-5 text-center shrink-0">{idx + 1}</span>
                          <input
                            type="text"
                            value={ai.text}
                            onChange={(e) => updateFormActionItem(ai.id, "text", e.target.value)}
                            placeholder="What needs to be done?"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
                          />
                          <button type="button" onClick={() => removeFormActionItem(ai.id)} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2 ml-7">
                          <input
                            type="text"
                            value={ai.assignee}
                            onChange={(e) => updateFormActionItem(ai.id, "assignee", e.target.value)}
                            placeholder="Assignee"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
                          />
                          <input
                            type="date"
                            value={ai.dueDate || ""}
                            onChange={(e) => updateFormActionItem(ai.id, "dueDate", e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-400 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || saving}
                className={cn("px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2", formData.title.trim() && !saving ? "bg-gradient-to-r from-wine-700 to-wine-800 text-white hover:from-wine-600 hover:to-wine-700 shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingMeeting ? "Save Changes" : "Create Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
