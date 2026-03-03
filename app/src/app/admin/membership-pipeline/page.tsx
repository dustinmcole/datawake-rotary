"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback, type DragEvent } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Calendar,
  X,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  SOURCE_LABELS,
  type Stage,
} from "@/lib/queries/membership-pipeline";

type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  classification: string;
  source: string;
  stage: string;
  nextAction: string;
  nextActionDue: string | null;
  notes: string;
  referredBy: string | null;
  sponsorId: string | null;
  createdAt: string;
  updatedAt: string;
};

const KANBAN_COLUMN_COLORS: Record<Stage, string> = {
  identified: "border-t-gray-400",
  reached_out: "border-t-blue-400",
  visited: "border-t-purple-400",
  sponsor_found: "border-t-amber-400",
  applied: "border-t-orange-400",
  board_approved: "border-t-emerald-400",
  inducted: "border-t-green-500",
  declined: "border-t-red-400",
};

export default function MembershipPipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const fetchProspects = useCallback(async () => {
    try {
      const url = search
        ? `/api/membership-pipeline?search=${encodeURIComponent(search)}`
        : "/api/membership-pipeline";
      const res = await fetch(url);
      if (res.ok) setProspects(await res.json());
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchProspects, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchProspects, search]);

  const handleStageChange = async (prospectId: string, newStage: string) => {
    // Optimistic update
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, stage: newStage } : p))
    );
    try {
      await fetch(`/api/membership-pipeline/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      fetchProspects(); // revert
    }
  };

  const handleDragStart = (e: DragEvent, prospectId: string) => {
    e.dataTransfer.setData("text/plain", prospectId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const prospectId = e.dataTransfer.getData("text/plain");
    if (prospectId) handleStageChange(prospectId, stage);
  };

  const grouped = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = prospects.filter((p) => p.stage === stage);
      return acc;
    },
    {} as Record<Stage, Prospect[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Membership Pipeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track prospective members through the membership process
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className={cn(
              "rounded-lg border px-3 py-2 text-center",
              STAGE_COLORS[stage]
            )}
          >
            <div className="text-lg font-bold">{grouped[stage]?.length ?? 0}</div>
            <div className="text-[11px] font-medium truncate">
              {STAGE_LABELS[stage]}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === "kanban" ? (
        /* Kanban Board */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className={cn(
                  "w-72 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-200 border-t-4 flex flex-col max-h-[calc(100vh-320px)]",
                  KANBAN_COLUMN_COLORS[stage],
                  dragOverStage === stage && "ring-2 ring-amber-400 bg-amber-50/30"
                )}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                    {grouped[stage]?.length ?? 0}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {(grouped[stage] ?? []).map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/membership-pipeline/${p.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      className="block bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {p.firstName} {p.lastName}
                            </span>
                          </div>
                          {p.company && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{p.company}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                      {p.nextAction && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 truncate">
                          {p.nextAction}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {SOURCE_LABELS[p.source] ?? p.source}
                        </span>
                        {p.nextActionDue && (
                          <span className="text-[10px] flex items-center gap-0.5 text-gray-400">
                            <Calendar className="w-2.5 h-2.5" />
                            {p.nextActionDue}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {(grouped[stage] ?? []).length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No prospects
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Company
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Contact
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Source
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Stage
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Next Action
                </th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/membership-pipeline/${p.id}`}
                      className="font-medium text-gray-900 hover:text-amber-600"
                    >
                      {p.firstName} {p.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.company || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      {p.email && (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      {p.phone && (
                        <Phone className="w-3.5 h-3.5" />
                      )}
                      {!p.email && !p.phone && "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {SOURCE_LABELS[p.source] ?? p.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded border",
                        STAGE_COLORS[p.stage as Stage]
                      )}
                    >
                      {STAGE_LABELS[p.stage as Stage] ?? p.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {p.nextAction || "—"}
                  </td>
                </tr>
              ))}
              {prospects.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400"
                  >
                    No prospects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAdd && (
        <AddProspectModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            fetchProspects();
          }}
        />
      )}
    </div>
  );
}

function AddProspectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    classification: "",
    source: "web_inquiry",
    notes: "",
    nextAction: "",
    nextActionDue: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/membership-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nextActionDue: form.nextActionDue || null,
        }),
      });
      if (res.ok) onCreated();
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Prospect</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                First Name *
              </label>
              <input
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Last Name *
              </label>
              <input
                required
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Company
              </label>
              <input
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Classification
              </label>
              <input
                value={form.classification}
                onChange={(e) =>
                  setForm((f) => ({ ...f, classification: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Source
            </label>
            <select
              value={form.source}
              onChange={(e) =>
                setForm((f) => ({ ...f, source: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white"
            >
              <option value="referral">Referral</option>
              <option value="walk_in">Walk-in</option>
              <option value="community_event">Community Event</option>
              <option value="web_inquiry">Web Inquiry</option>
              <option value="crm_import">CRM Import</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Next Action
              </label>
              <input
                value={form.nextAction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nextAction: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={form.nextActionDue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nextActionDue: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
