"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Globe,
  EyeOff,
  Trash2,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string | null;
  pinned: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORIES = ["general", "urgent", "event", "committee"];

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-600",
  urgent: "bg-red-50 text-red-700",
  event: "bg-blue-50 text-blue-700",
  committee: "bg-purple-50 text-purple-700",
};

// ── Compose Modal ─────────────────────────────────────────────────────────────

function ComposeModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement?: Announcement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: announcement?.title ?? "",
    content: announcement?.content ?? "",
    category: announcement?.category ?? "general",
    pinned: announcement?.pinned ?? false,
    publish: !!announcement?.publishedAt,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.title || !form.content) { setError("Title and content are required"); return; }
    setSaving(true); setError("");
    try {
      const url = announcement ? `/api/admin/announcements/${announcement.id}` : "/api/admin/announcements";
      const method = announcement ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {announcement ? "Edit Announcement" : "New Announcement"}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Title *</span>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Announcement title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">Content *</span>
              <textarea
                rows={6}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Write your announcement here..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-700 block mb-1">Category</span>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white capitalize"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.pinned}
                  onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Pin to top of announcement list</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.publish}
                  onChange={(e) => setForm((f) => ({ ...f, publish: e.target.checked }))}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Publish immediately (visible to members)</span>
              </label>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
          </div>
          <div className="p-5 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {form.publish ? "Save & Publish" : "Save as Draft"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnnouncementsManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  async function togglePin(a: Announcement) {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !a.pinned }),
    });
    load();
  }

  async function togglePublish(a: Announcement) {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: a.publishedAt ? "unpublish" : "publish" }),
    });
    load();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = announcements.filter((a) => {
    if (filter === "published") return !!a.publishedAt;
    if (filter === "draft") return !a.publishedAt;
    return true;
  });

  const publishedCount = announcements.filter((a) => !!a.publishedAt).length;
  const draftCount = announcements.filter((a) => !a.publishedAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">
            {publishedCount} published · {draftCount} drafts
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([["all", "All"], ["published", "Published"], ["draft", "Drafts"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="h-4 rounded bg-gray-100 w-1/2 mb-2" />
              <div className="h-3 rounded bg-gray-100 w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {announcements.length === 0 ? "No announcements yet. Create your first one." : "No announcements match your filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={cn(
              "rounded-xl border bg-white p-5 transition-all",
              a.pinned ? "border-amber-200 bg-amber-50/30" : "border-gray-200"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {a.pinned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", CATEGORY_COLORS[a.category] ?? "bg-gray-100 text-gray-600")}>
                      {a.category}
                    </span>
                    {a.publishedAt ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Published
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Created {formatDate(a.createdAt)}
                    {a.publishedAt && ` · Published ${formatDate(a.publishedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePin(a)}
                    title={a.pinned ? "Unpin" : "Pin"}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    {a.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => togglePublish(a)}
                    title={a.publishedAt ? "Unpublish" : "Publish"}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    {a.publishedAt ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(a)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <ComposeModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editing && <ComposeModal announcement={editing} onClose={() => setEditing(null)} onSaved={() => { load(); setEditing(null); }} />}
    </div>
  );
}
