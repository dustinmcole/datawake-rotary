"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageSquare, Plus, Send, Trash2, Edit3, X, Loader2, CheckCircle2,
  AlertCircle, Clock, Users, FileText, PhoneOff, BarChart2, RefreshCw,
  Eye, Calendar, PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Broadcast {
  id: string;
  title: string;
  message: string;
  status: string;
  targetGroup: string;
  targetFilter: string;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  creatorFirstName?: string;
  creatorLastName?: string;
}

interface BroadcastDetail extends Broadcast {
  recipients: Recipient[];
}

interface Recipient {
  id: string;
  name: string;
  phone: string;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

interface OptOut {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  optedOutAt: string;
  optedInAt: string | null;
  optedOutBy: string;
  active: boolean;
  notes: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-50 text-blue-700",
  sending: "bg-yellow-50 text-yellow-700",
  sent: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

const TARGET_LABELS: Record<string, string> = {
  all: "All Active Members",
  "role:super_admin": "Super Admins",
  "role:club_admin": "Club Admins",
  "role:board_member": "Board Members",
  "role:member": "Members",
  "attendance:recent": "Recent Attendees (30 days)",
};

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function smsCharCount(msg: string) {
  const len = msg.length;
  const segments = Math.ceil(len / 160) || 1;
  return { len, segments };
}

// ── Compose Modal ─────────────────────────────────────────────────────────────

function ComposeModal({
  broadcast,
  templates,
  onClose,
  onSaved,
}: {
  broadcast?: Broadcast;
  templates: Template[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(broadcast?.title ?? "");
  const [message, setMessage] = useState(broadcast?.message ?? "");
  const [targetGroup, setTargetGroup] = useState(broadcast?.targetGroup ?? "all");
  const [scheduledAt, setScheduledAt] = useState(
    broadcast?.scheduledAt ? new Date(broadcast.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { len, segments } = smsCharCount(message);

  async function handleSave() {
    if (!title.trim() || !message.trim()) { setError("Title and message are required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { title: title.trim(), message: message.trim(), targetGroup, scheduledAt: scheduledAt || null };
      const url = broadcast ? `/api/messaging/broadcasts/${broadcast.id}` : "/api/messaging/broadcasts";
      const method = broadcast ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Save failed"); }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{broadcast ? "Edit Broadcast" : "New Broadcast"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Meeting reminder — Jan 7" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Recipients</label>
            <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(TARGET_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Message</label>
              {templates.length > 0 && (
                <select
                  className="text-xs border rounded px-2 py-1 text-gray-600"
                  defaultValue=""
                  onChange={e => { const t = templates.find(t => t.id === e.target.value); if (t) setMessage(t.content); }}
                >
                  <option value="">Load template…</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              maxLength={1600}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Type your SMS message…"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{len} chars · {segments} SMS segment{segments !== 1 ? "s" : ""}</span>
              <span>Max 1600 chars</span>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><Eye className="w-3 h-3" />Preview</div>
            <div className="bg-blue-500 text-white text-sm rounded-2xl rounded-tl-none px-4 py-2 max-w-xs inline-block whitespace-pre-wrap">
              {message || <span className="italic opacity-60">Your message will appear here</span>}
            </div>
            <div className="mt-1 text-xs text-gray-400">Sending to: <strong>{TARGET_LABELS[targetGroup] ?? targetGroup}</strong></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Schedule (optional)</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank to save as draft.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {broadcast ? "Save Changes" : "Create Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delivery Report Modal ─────────────────────────────────────────────────────

function ReportModal({ broadcastId, onClose }: { broadcastId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<BroadcastDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/messaging/broadcasts/${broadcastId}`)
      .then(r => r.json())
      .then(d => setDetail(d))
      .finally(() => setLoading(false));
  }, [broadcastId]);

  const STATUS_ICON: Record<string, React.ReactNode> = {
    sent: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    delivered: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    opted_out: <PhoneOff className="w-4 h-4 text-orange-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart2 className="w-5 h-5" />Delivery Report</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : !detail ? (
            <p className="text-center text-gray-400">No data found.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{detail.successCount}</div>
                  <div className="text-xs text-green-600">Delivered</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{detail.failureCount}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{detail.totalRecipients}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Phone</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detail.recipients.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{r.name || "—"}</td>
                        <td className="px-4 py-2 text-gray-500">{r.phone}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            {STATUS_ICON[r.status] ?? null}
                            <span className="capitalize">{r.status}</span>
                            {r.errorMessage && <span className="text-xs text-red-400 ml-1">({r.errorMessage})</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {detail.recipients.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No recipients</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Template Modal ────────────────────────────────────────────────────────────

function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template?: Template;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [content, setContent] = useState(template?.content ?? "");
  const [category, setCategory] = useState(template?.category ?? "general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim() || !content.trim()) { setError("Name and content required."); return; }
    setSaving(true);
    try {
      const url = template ? `/api/messaging/templates/${template.id}` : "/api/messaging/templates";
      const method = template ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content, category }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{template ? "Edit Template" : "New Template"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Meeting reminder" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["general", "meeting", "event", "urgent", "newsletter"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="SMS content…" />
            <div className="text-xs text-gray-400 mt-1">{content.length} chars</div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MessagingPage() {
  const [tab, setTab] = useState<"broadcasts" | "templates" | "optouts">("broadcasts");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editBroadcast, setEditBroadcast] = useState<Broadcast | undefined>();
  const [reportId, setReportId] = useState<string | null>(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | undefined>();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [optOutPhone, setOptOutPhone] = useState("");
  const [addingOptOut, setAddingOptOut] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messaging/broadcasts");
      const data = await res.json();
      setBroadcasts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    const res = await fetch("/api/messaging/templates");
    const data = await res.json();
    setTemplates(data);
  }, []);

  const loadOptOuts = useCallback(async () => {
    const res = await fetch("/api/messaging/opt-outs");
    const data = await res.json();
    setOptOuts(data);
  }, []);

  useEffect(() => {
    loadBroadcasts();
    loadTemplates();
    loadOptOuts();
  }, [loadBroadcasts, loadTemplates, loadOptOuts]);

  async function handleSend(id: string) {
    if (!confirm("Send this broadcast now? This cannot be undone.")) return;
    setSendingId(id);
    try {
      const res = await fetch(`/api/messaging/broadcasts/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Sent to ${data.sent} recipients (${data.failed} failed)`);
      loadBroadcasts();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Send failed", false);
    } finally {
      setSendingId(null);
    }
  }

  async function handleDeleteBroadcast(id: string) {
    if (!confirm("Delete this broadcast?")) return;
    const res = await fetch(`/api/messaging/broadcasts/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Deleted"); loadBroadcasts(); }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/messaging/templates/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Deleted"); loadTemplates(); }
  }

  async function handleRemoveOptOut(id: string) {
    if (!confirm("Re-opt-in this number? They will receive future broadcasts.")) return;
    const res = await fetch(`/api/messaging/opt-outs/${id}`, { method: "PATCH" });
    if (res.ok) { showToast("Re-opted in"); loadOptOuts(); }
  }

  async function handleAddOptOut() {
    if (!optOutPhone.trim()) return;
    setAddingOptOut(true);
    try {
      const res = await fetch("/api/messaging/opt-outs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: optOutPhone.trim(), optedOutBy: "admin" }),
      });
      if (!res.ok) throw new Error("Failed");
      setOptOutPhone("");
      showToast("Phone opted out");
      loadOptOuts();
    } catch {
      showToast("Failed to opt out", false);
    } finally {
      setAddingOptOut(false);
    }
  }

  const TABS = [
    { id: "broadcasts", label: "Broadcasts", icon: MessageSquare },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "optouts", label: "Opt-Outs", icon: PhoneOff },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            SMS Broadcasts
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Send targeted text messages to members</p>
        </div>
        <div className="flex gap-2">
          {tab === "broadcasts" && (
            <button onClick={() => { setEditBroadcast(undefined); setComposeOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" />New Broadcast
            </button>
          )}
          {tab === "templates" && (
            <button onClick={() => { setEditTemplate(undefined); setTemplateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" />New Template
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Broadcasts Tab */}
      {tab === "broadcasts" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No broadcasts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(b => (
                <div key={b.id} className="bg-white border rounded-xl p-5 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{b.title}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", STATUS_COLORS[b.status] ?? STATUS_COLORS.draft)}>{b.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.message}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{TARGET_LABELS[b.targetGroup] ?? b.targetGroup}</span>
                        {b.scheduledAt && b.status === "scheduled" && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(b.scheduledAt)}</span>
                        )}
                        {b.sentAt && (
                          <span className="flex items-center gap-1"><Send className="w-3.5 h-3.5" />{formatDate(b.sentAt)} · {b.successCount}/{b.totalRecipients} sent</span>
                        )}
                        <span>{formatDate(b.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === "sent" && (
                        <button onClick={() => setReportId(b.id)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="View report">
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      )}
                      {(b.status === "draft" || b.status === "scheduled") && (
                        <>
                          <button onClick={() => { setEditBroadcast(b); setComposeOpen(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSend(b.id)}
                            disabled={sendingId === b.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {sendingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Send Now
                          </button>
                        </>
                      )}
                      {b.status !== "sending" && (
                        <button onClick={() => handleDeleteBroadcast(b.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {tab === "templates" && (
        <div>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No templates yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map(t => (
                <div key={t.id} className="bg-white border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">{t.category}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-3">{t.content}</p>
                      <div className="text-xs text-gray-400 mt-2">{t.content.length} chars</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditTemplate(t); setTemplateModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opt-Outs Tab */}
      {tab === "optouts" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>TCPA Compliance:</strong> All opted-out numbers are automatically excluded from broadcasts. Opt-outs are honored immediately and permanently until explicitly reversed by an admin.
          </div>

          {/* Add opt-out */}
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><PhoneOff className="w-4 h-4" />Add Opt-Out</h3>
            <div className="flex gap-3">
              <input
                value={optOutPhone}
                onChange={e => setOptOutPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddOptOut}
                disabled={addingOptOut || !optOutPhone.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {addingOptOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
                Opt Out
              </button>
            </div>
          </div>

          {/* Opt-out list */}
          {optOuts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <PhoneCall className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No opt-outs recorded.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Member</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Opted Out</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {optOuts.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">{o.phone}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {o.firstName ? `${o.firstName} ${o.lastName}` : "—"}
                        {o.email && <div className="text-xs text-gray-400">{o.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(o.optedOutAt)}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{o.optedOutBy.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", o.active ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                          {o.active ? "Opted Out" : "Re-opted In"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {o.active && (
                          <button onClick={() => handleRemoveOptOut(o.id)} className="text-xs text-blue-600 hover:underline">Re-opt In</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {composeOpen && (
        <ComposeModal
          broadcast={editBroadcast}
          templates={templates}
          onClose={() => { setComposeOpen(false); setEditBroadcast(undefined); }}
          onSaved={() => { setComposeOpen(false); setEditBroadcast(undefined); loadBroadcasts(); showToast("Broadcast saved"); }}
        />
      )}
      {reportId && <ReportModal broadcastId={reportId} onClose={() => setReportId(null)} />}
      {templateModal && (
        <TemplateModal
          template={editTemplate}
          onClose={() => { setTemplateModal(false); setEditTemplate(undefined); }}
          onSaved={() => { setTemplateModal(false); setEditTemplate(undefined); loadTemplates(); showToast("Template saved"); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all",
          toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
