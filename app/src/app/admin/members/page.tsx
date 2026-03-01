"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Upload,
  X,
  ChevronDown,
  Mail,
  Building2,
  Check,
  Loader2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role =
  | "super_admin" | "club_admin" | "board_member" | "website_admin"
  | "uncorked_committee" | "committee_chair" | "member" | "guest";

type MemberType = "active" | "honorary" | "alumni" | "leave" | "prospect";
type MemberStatus = "active" | "inactive" | "suspended";

interface Member {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  classification: string;
  memberType: MemberType;
  status: MemberStatus;
  roles: string; // JSON string
  createdAt: string;
}

const ALL_ROLES: Role[] = [
  "super_admin", "club_admin", "board_member", "website_admin",
  "uncorked_committee", "committee_chair", "member", "guest",
];

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  club_admin: "Club Admin",
  board_member: "Board Member",
  website_admin: "Website Admin",
  uncorked_committee: "Uncorked Committee",
  committee_chair: "Committee Chair",
  member: "Member",
  guest: "Guest",
};

const MEMBER_TYPES: MemberType[] = ["active", "honorary", "alumni", "leave", "prospect"];

function parseRoles(rolesJson: string): Role[] {
  try { return JSON.parse(rolesJson); } catch (_) { return ["member"]; }
}

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<string, string> = {
    super_admin: "bg-red-50 text-red-700 border-red-200",
    club_admin: "bg-amber-50 text-amber-700 border-amber-200",
    board_member: "bg-purple-50 text-purple-700 border-purple-200",
    website_admin: "bg-blue-50 text-blue-700 border-blue-200",
    uncorked_committee: "bg-rose-50 text-rose-700 border-rose-200",
    committee_chair: "bg-indigo-50 text-indigo-700 border-indigo-200",
    member: "bg-gray-50 text-gray-600 border-gray-200",
    guest: "bg-gray-50 text-gray-400 border-gray-100",
  };
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium", colors[role] ?? "bg-gray-50 text-gray-600 border-gray-200")}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

// ── Edit Slide-Over ──────────────────────────────────────────────────────────

function EditDrawer({
  member,
  onClose,
  onSaved,
}: {
  member: Member;
  onClose: () => void;
  onSaved: (m: Member) => void;
}) {
  const [form, setForm] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    company: member.company,
    classification: member.classification,
    memberType: member.memberType as MemberType,
    status: member.status as MemberStatus,
    roles: parseRoles(member.roles),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleRole(role: Role) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      onSaved(updated);
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Member</h2>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">First Name</span>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Last Name</span>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 block mb-1">Phone</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 block mb-1">Company / Employer</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 block mb-1">Classification</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Attorney, Real Estate, Dentistry"
              value={form.classification}
              onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Member Type</span>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.memberType}
                onChange={(e) => setForm((f) => ({ ...f, memberType: e.target.value as MemberType }))}
              >
                {MEMBER_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Status</span>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MemberStatus }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {/* Roles */}
          <div>
            <span className="text-xs font-medium text-gray-700 block mb-2">Roles</span>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    form.roles.includes(role)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  )}
                >
                  {form.roles.includes(role) && <Check className="w-3 h-3" />}
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

// ── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", roles: ["member"] as Role[] });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggleRole(role: Role) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  async function send() {
    if (!form.email) { setError("Email is required"); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/admin/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite");
      }
      setSuccess(true);
      onInvited();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Invite Member</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {success ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-700">
                <Check className="w-5 h-5" />
                <p className="font-medium">Invitation sent!</p>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-gray-700 block mb-1">Email *</span>
                  <input
                    type="email"
                    placeholder="member@example.com"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700 block mb-1">First Name</span>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700 block mb-1">Last Name</span>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </label>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700 block mb-2">Roles to assign</span>
                  <div className="flex flex-wrap gap-2">
                    {ALL_ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-xs font-medium transition-all",
                          form.roles.includes(role)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <button
                  onClick={send}
                  disabled={sending}
                  className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Invitation
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── CSV Import Modal ─────────────────────────────────────────────────────────

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  async function doPreview() {
    setPreviewing(true); setError("");
    try {
      const res = await fetch("/api/admin/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, preview: true }),
      });
      const data = await res.json();
      setPreview(data.rows ?? []);
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      setError("Failed to parse CSV");
    } finally {
      setPreviewing(false);
    }
  }

  async function doImport() {
    setImporting(true); setError("");
    try {
      const res = await fetch("/api/admin/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, preview: false }),
      });
      const data = await res.json();
      setResult(data);
      onImported();
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      setError("Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Import Members</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {result ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">Import Complete</p>
                <p className="text-gray-500 mt-2">{result.imported} members imported · {result.failed} failed</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Paste CSV data from your DACdb export or any member list. Required column: <code className="bg-gray-100 px-1 rounded text-xs">email</code>
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Supported columns: email, firstname/first name, lastname/last name, phone, company, classification, member type
                  </p>
                  <textarea
                    rows={8}
                    placeholder="email,firstname,lastname,phone,company,classification&#10;john@example.com,John,Smith,714-555-0100,Smith Law,Attorney"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={csvText}
                    onChange={(e) => { setCsvText(e.target.value); setPreview(null); }}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                {!preview && (
                  <button
                    onClick={doPreview}
                    disabled={!csvText.trim() || previewing}
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {previewing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Preview Import ({csvText.trim() ? "..." : "0 rows"})
                  </button>
                )}
                {preview && (
                  <>
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">{preview.length} members ready to import</p>
                      </div>
                      <div className="overflow-x-auto max-h-48">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              {["Email", "First", "Last", "Company", "Classification", "Type"].map((h) => (
                                <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {preview.slice(0, 20).map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700">{row.email}</td>
                                <td className="px-3 py-2 text-gray-600">{row.firstName}</td>
                                <td className="px-3 py-2 text-gray-600">{row.lastName}</td>
                                <td className="px-3 py-2 text-gray-600">{row.company}</td>
                                <td className="px-3 py-2 text-gray-600">{row.classification}</td>
                                <td className="px-3 py-2 text-gray-600">{row.memberType}</td>
                              </tr>
                            ))}
                            {preview.length > 20 && (
                              <tr>
                                <td colSpan={6} className="px-3 py-2 text-center text-gray-400">
                                  + {preview.length - 20} more rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPreview(null)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Edit CSV
                      </button>
                      <button
                        onClick={doImport}
                        disabled={importing}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                        Import {preview.length} Members
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MemberManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = members;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.classification.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") list = list.filter((m) => m.memberType === filterType);
    if (filterStatus !== "all") list = list.filter((m) => m.status === filterStatus);
    return list;
  }, [members, search, filterType, filterStatus]);

  function onMemberSaved(updated: Member) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-sm text-gray-500">
            {members.length} total members · {members.filter((m) => m.status === "active").length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search by name, email, company..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All types</option>
            {MEMBER_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded bg-gray-100 w-40" />
                  <div className="h-3 rounded bg-gray-100 w-56" />
                </div>
                <div className="h-3 rounded bg-gray-100 w-24" />
                <div className="h-3 rounded bg-gray-100 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {members.length === 0 ? "No members in the database yet. Import from DACdb or invite members." : "No members match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Classification</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Roles</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => {
                  const roles = parseRoles(m.roles);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">
                              {(m.firstName[0] ?? "") + (m.lastName[0] ?? "")}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" /> {m.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{m.company || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-sm text-gray-600">{m.classification || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                          {m.memberType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {roles.slice(0, 2).map((r) => <RoleBadge key={r} role={r} />)}
                          {roles.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{roles.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          m.status === "active" ? "bg-emerald-50 text-emerald-700" :
                          m.status === "inactive" ? "bg-gray-100 text-gray-500" :
                          "bg-red-50 text-red-700"
                        )}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {members.length} members · Click a row to edit
            </div>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {selectedMember && (
        <EditDrawer
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSaved={onMemberSaved}
        />
      )}

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={load}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={load}
        />
      )}
    </div>
  );
}
