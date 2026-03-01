"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Users,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Committee {
  id: string;
  name: string;
  description: string;
  chairUserId: string | null;
  category: string;
  active: boolean;
  createdAt: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  standing: "bg-blue-50 text-blue-700",
  special: "bg-purple-50 text-purple-700",
  ad_hoc: "bg-amber-50 text-amber-700",
};

// ── Create Committee Modal ────────────────────────────────────────────────────

function CreateModal({
  onClose,
  onCreated,
  members,
}: {
  onClose: () => void;
  onCreated: () => void;
  members: Member[];
}) {
  const [form, setForm] = useState({ name: "", description: "", category: "standing", chairUserId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.name) { setError("Name required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, chairUserId: form.chairUserId || null }),
      });
      if (!res.ok) throw new Error("Failed to create");
      onCreated(); onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">New Committee</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Committee Name *</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Description</span>
              <textarea rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Type</span>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="standing">Standing</option>
                  <option value="special">Special</option>
                  <option value="ad_hoc">Ad Hoc</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Chair</span>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.chairUserId} onChange={(e) => setForm((f) => ({ ...f, chairUserId: e.target.value }))}>
                  <option value="">— None —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommitteeManagementPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Committee | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<{ user: Member; membership: { role: string } }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addUserId, setAddUserId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/committees").then((r) => r.json()),
      fetch("/api/admin/members").then((r) => r.json()),
    ])
      .then(([comms, mems]) => {
        setCommittees(Array.isArray(comms) ? comms : []);
        setMembers(Array.isArray(mems) ? mems : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/committees").then((r) => r.json()),
      fetch("/api/admin/members").then((r) => r.json()),
    ])
      .then(([comms, mems]) => {
        setCommittees(Array.isArray(comms) ? comms : []);
        setMembers(Array.isArray(mems) ? mems : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    fetch(`/api/admin/committees/${selected.id}?members=true`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setCommitteeMembers(data.members ?? []); })
      .catch(() => { if (!cancelled) setCommitteeMembers([]); });
    return () => { cancelled = true; };
  }, [selected]);

  async function addMember() {
    if (!selected || !addUserId) return;
    try {
      const res = await fetch(`/api/admin/committees/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_member", userId: addUserId }),
      });
      if (!res.ok) return;
      setAddUserId("");
      const data = await fetch(`/api/admin/committees/${selected.id}?members=true`).then((r) => r.json());
      setCommitteeMembers(data.members ?? []);
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // silently fail — UI remains in sync since we don't optimistically update
    }
  }

  async function removeMember(userId: string) {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/committees/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_member", userId }),
      });
      if (res.ok) {
        setCommitteeMembers((prev) => prev.filter((m) => m.user.id !== userId));
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // silently fail — re-fetch to stay in sync
      const data = await fetch(`/api/admin/committees/${selected.id}?members=true`).then((r) => r.json());
      setCommitteeMembers(data.members ?? []);
    }
  }

  async function archiveCommittee(id: string) {
    if (!confirm("Archive this committee?")) return;
    try {
      await fetch(`/api/admin/committees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      if (selected?.id === id) { setSelected(null); setCommitteeMembers([]); }
      load();
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // silently fail
    }
  }

  const availableToAdd = members.filter(
    (m) => !committeeMembers.some((cm) => cm.user.id === m.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Committee Management</h1>
          <p className="text-sm text-gray-500">{committees.length} committees</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Committee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Committee list */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {loading ? (
              <div className="divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 rounded bg-gray-100 w-32" />
                      <div className="h-3 rounded bg-gray-100 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : committees.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No committees yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {committees.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 text-left hover:bg-blue-50/30 transition-colors",
                      selected?.id === c.id && "bg-blue-50"
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium capitalize", CATEGORY_COLORS[c.category] ?? "bg-gray-100 text-gray-600")}>
                        {c.category.replace("_", " ")}
                      </span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 shrink-0 transition-colors", selected?.id === c.id ? "text-blue-500" : "text-gray-300")} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Committee detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a committee to manage its members</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {/* Committee header */}
              <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                  {selected.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{selected.description}</p>
                  )}
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize mt-2 inline-block", CATEGORY_COLORS[selected.category] ?? "bg-gray-100 text-gray-600")}>
                    {selected.category.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={() => archiveCommittee(selected.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Archive committee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Add member */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Add Member</p>
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                  >
                    <option value="">— Select member —</option>
                    {availableToAdd.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                  <button
                    onClick={addMember}
                    disabled={!addUserId}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Members list */}
              <div>
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Members ({committeeMembers.length})
                  </p>
                </div>
                {loadingMembers ? (
                  <div className="p-6 text-center text-sm text-gray-400 animate-pulse">Loading members...</div>
                ) : committeeMembers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No members assigned yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {committeeMembers.map(({ user, membership }) => (
                      <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-700">
                            {(user.firstName[0] ?? "") + (user.lastName[0] ?? "")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize shrink-0">
                          {membership.role}
                        </span>
                        <button
                          onClick={() => removeMember(user.id)}
                          className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateModal members={members} onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
