"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Plus, Upload, Download, X, ChevronDown,
  Loader2, AlertCircle, Clock, Phone, Mail, Building2,
  Pencil, Trash2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ContactType = "partner" | "guest" | "speaker" | "referral" | "donor";
type ContactStatus = "cold" | "warm" | "active" | "inactive";
type ActivityType = "note" | "call" | "email" | "meeting" | "event" | "other";

interface CommunityContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  type: ContactType;
  status: ContactStatus;
  notes: string;
  website: string;
  address: string;
  assignedTo: string;
  createdAt: string;
}

interface ContactActivity {
  id: string;
  contactId: string;
  activityType: ActivityType;
  description: string;
  activityDate: string;
  loggedBy: string;
}

const TYPE_COLORS: Record<ContactType, string> = {
  partner: "bg-blue-50 text-blue-700 border-blue-200",
  guest: "bg-gray-50 text-gray-600 border-gray-200",
  speaker: "bg-purple-50 text-purple-700 border-purple-200",
  referral: "bg-green-50 text-green-700 border-green-200",
  donor: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
  cold: "bg-slate-100 text-slate-600",
  warm: "bg-orange-100 text-orange-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-600",
};

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  note: "📝", call: "📞", email: "✉️", meeting: "🤝", event: "🎉", other: "💬",
};

const CONTACT_TYPES: ContactType[] = ["partner", "guest", "speaker", "referral", "donor"];
const CONTACT_STATUSES: ContactStatus[] = ["cold", "warm", "active", "inactive"];
const ACTIVITY_TYPES: ActivityType[] = ["note", "call", "email", "meeting", "event", "other"];

// ─── Modal ────────────────────────────────────────────────────────────────────

function ContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: CommunityContact | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<Partial<CommunityContact>>(
    contact ?? { type: "guest", status: "cold" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof CommunityContact, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const method = contact ? "PATCH" : "POST";
      const body = contact ? { id: contact.id, ...form } : form;
      const res = await fetch("/api/community-contacts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, key: keyof CommunityContact, type = "text") => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => set(key, e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{contact ? "Edit Contact" : "New Contact"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("First Name *", "firstName")}
            {field("Last Name *", "lastName")}
            {field("Email", "email", "email")}
            {field("Phone", "phone", "tel")}
            {field("Company", "company")}
            {field("Website", "website", "url")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select
                value={form.type ?? "guest"}
                onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status ?? "cold"}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONTACT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          {field("Address", "address")}
          {field("Assigned To", "assignedTo")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {contact ? "Save Changes" : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Activity Panel ──────────────────────────────────────────────────────────

function ActivityPanel({ contact, onClose }: { contact: CommunityContact; onClose: () => void }) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState<ActivityType>("note");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community-contacts/${contact.id}/activities`);
      setActivities(await res.json());
    } finally {
      setLoading(false);
    }
  }, [contact.id]);

  useEffect(() => { load(); }, [load]);

  async function addActivity() {
    if (!newDesc.trim()) return;
    setAdding(true);
    try {
      await fetch(`/api/community-contacts/${contact.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: newType, description: newDesc }),
      });
      setNewDesc("");
      await load();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold">{contact.firstName} {contact.lastName}</h2>
            <p className="text-xs text-gray-500">Activity Timeline</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : activities.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No activities yet</p>
          ) : (
            [...activities].reverse().map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="text-lg mt-0.5">{ACTIVITY_ICONS[a.activityType as ActivityType] ?? "💬"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium capitalize text-gray-700">{a.activityType}</span>
                    <span className="text-xs text-gray-400">{new Date(a.activityDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t space-y-2">
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ActivityType)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
              placeholder="Add activity note…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addActivity}
              disabled={adding || !newDesc.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityCRMPage() {
  const [contacts, setContacts] = useState<CommunityContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalContact, setModalContact] = useState<CommunityContact | null | "new">(null);
  const [activityContact, setActivityContact] = useState<CommunityContact | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/community-contacts?${params}`);
      setContacts(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/community-contacts?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/community-contacts/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportMsg(`✓ Imported ${data.imported} contacts`);
        await load();
      } else {
        setImportMsg(`✗ ${data.error}`);
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  function handleExport() {
    window.open("/api/community-contacts/export", "_blank");
  }

  const shown = contacts;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community CRM</h1>
              <p className="text-sm text-gray-500">{shown.length} contact{shown.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <label className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer",
              importing && "opacity-50 pointer-events-none"
            )}>
              <Upload className="w-4 h-4" />
              {importing ? "Importing…" : "Import CSV"}
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
            <button
              onClick={() => setModalContact("new")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>
        </div>

        {importMsg && (
          <div className={cn(
            "mb-4 text-sm px-4 py-2 rounded-lg",
            importMsg.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          )}>
            {importMsg}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <option value="">All Types</option>
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <option value="">All Statuses</option>
            {CONTACT_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {(filterType || filterStatus || search) && (
            <button
              onClick={() => { setSearch(""); setFilterType(""); setFilterStatus(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : shown.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400 mt-1">Add contacts or adjust filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{c.firstName} {c.lastName}</div>
                      {c.assignedTo && <div className="text-xs text-gray-400">→ {c.assignedTo}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", TYPE_COLORS[c.type as ContactType] ?? "bg-gray-50 text-gray-600 border-gray-200")}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[c.status as ContactStatus] ?? "bg-gray-100 text-gray-600")}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {c.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />{c.email}
                          </div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />{c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.company && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="w-3 h-3" />{c.company}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setActivityContact(c)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                          title="Activity timeline"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModalContact(c)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalContact !== null && (
        <ContactModal
          contact={modalContact === "new" ? null : modalContact}
          onClose={() => setModalContact(null)}
          onSave={() => { setModalContact(null); load(); }}
        />
      )}
      {activityContact && (
        <ActivityPanel
          contact={activityContact}
          onClose={() => setActivityContact(null)}
        />
      )}
    </div>
  );
}
