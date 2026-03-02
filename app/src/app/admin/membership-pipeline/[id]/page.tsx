"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  Clock,
  MessageSquare,
  PhoneCall,
  Eye,
  MoreHorizontal,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  SOURCE_LABELS,
  ACTIVITY_TYPE_LABELS,
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
  stageUpdatedAt: string;
  nextAction: string;
  nextActionDue: string | null;
  notes: string;
  referredBy: string | null;
  sponsorId: string | null;
  convertedUserId: string | null;
  sourceInquiryId: string | null;
  sourceContactId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type Activity = {
  id: string;
  prospectId: string;
  activityType: string;
  fromStage: string | null;
  toStage: string | null;
  description: string;
  activityDate: string;
  loggedBy: string | null;
  createdAt: string;
};

const ACTIVITY_ICONS: Record<string, typeof MessageSquare> = {
  stage_change: Clock,
  note: MessageSquare,
  call: PhoneCall,
  email: Mail,
  meeting: User,
  visit: Eye,
  other: MoreHorizontal,
};

export default function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Prospect>>({});
  const [saving, setSaving] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/membership-pipeline/${id}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`/api/membership-pipeline/${id}/activities`).then((r) =>
        r.ok ? r.json() : []
      ),
    ]).then(([p, a]) => {
      setProspect(p);
      setActivities(a);
      if (p) setForm(p);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/membership-pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProspect(updated);
        setForm(updated);
        setEditing(false);
        // Refresh activities in case of stage change
        const acts = await fetch(
          `/api/membership-pipeline/${id}/activities`
        ).then((r) => r.json());
        setActivities(acts);
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this prospect? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/membership-pipeline/${id}`, {
        method: "DELETE",
      });
      if (res.ok) window.location.href = "/admin/membership-pipeline";
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore
    }
  };

  const handleActivityCreated = async () => {
    setShowAddActivity(false);
    const acts = await fetch(
      `/api/membership-pipeline/${id}/activities`
    ).then((r) => r.json());
    setActivities(acts);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Prospect not found</p>
        <Link
          href="/admin/membership-pipeline"
          className="text-amber-600 hover:text-amber-700 text-sm mt-2 inline-block"
        >
          Back to Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/membership-pipeline"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Pipeline
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {prospect.firstName} {prospect.lastName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded border",
                STAGE_COLORS[prospect.stage as Stage]
              )}
            >
              {STAGE_LABELS[prospect.stage as Stage] ?? prospect.stage}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {SOURCE_LABELS[prospect.source] ?? prospect.source}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setForm(prospect);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Prospect Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                icon={User}
                label="First Name"
                value={form.firstName ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
              />
              <Field
                icon={User}
                label="Last Name"
                value={form.lastName ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
              />
              <Field
                icon={Mail}
                label="Email"
                value={form.email ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <Field
                icon={Phone}
                label="Phone"
                value={form.phone ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <Field
                icon={Building2}
                label="Company"
                value={form.company ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
              />
              <Field
                icon={Building2}
                label="Classification"
                value={form.classification ?? ""}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, classification: v }))}
              />
            </div>
          </div>

          {/* Pipeline Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Pipeline Status
            </h2>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Stage
                  </label>
                  <select
                    value={form.stage ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stage: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Source
                  </label>
                  <select
                    value={form.source ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white"
                  >
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Next Action
                  </label>
                  <input
                    value={form.nextAction ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nextAction: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.nextActionDue ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nextActionDue: e.target.value || null,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Stage progress bar */}
                <div className="flex gap-1">
                  {STAGES.filter((s) => s !== "declined").map((s) => {
                    const idx = STAGES.indexOf(s);
                    const currentIdx = STAGES.indexOf(
                      prospect.stage as Stage
                    );
                    const isActive =
                      prospect.stage !== "declined" && idx <= currentIdx;
                    return (
                      <div
                        key={s}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-colors",
                          isActive ? "bg-amber-400" : "bg-gray-200"
                        )}
                        title={STAGE_LABELS[s]}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Next Action</span>
                    <p className="font-medium text-gray-900">
                      {prospect.nextAction || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Due Date</span>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      {prospect.nextActionDue ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {prospect.nextActionDue}
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
                {prospect.notes && (
                  <div>
                    <span className="text-xs text-gray-500">Notes</span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                      {prospect.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Activity Timeline
            </h2>
            <button
              onClick={() => setShowAddActivity(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Log Activity
            </button>
          </div>

          <div className="space-y-0">
            {activities.map((activity, i) => {
              const Icon =
                ACTIVITY_ICONS[activity.activityType] ?? MoreHorizontal;
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        activity.activityType === "stage_change"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {i < activities.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4 min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {ACTIVITY_TYPE_LABELS[activity.activityType] ??
                        activity.activityType}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    {activity.fromStage && activity.toStage && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                            STAGE_COLORS[activity.fromStage as Stage]
                          )}
                        >
                          {STAGE_LABELS[activity.fromStage as Stage]}
                        </span>
                        <span className="text-gray-400 text-[10px]">→</span>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                            STAGE_COLORS[activity.toStage as Stage]
                          )}
                        >
                          {STAGE_LABELS[activity.toStage as Stage]}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(activity.activityDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">
                No activity yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <AddActivityModal
          prospectId={id}
          onClose={() => setShowAddActivity(false)}
          onCreated={handleActivityCreated}
        />
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  editing,
  onChange,
}: {
  icon: typeof User;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  if (editing) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div>
        <span className="text-xs text-gray-500">{label}</span>
        <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function AddActivityModal({
  prospectId,
  onClose,
  onCreated,
}: {
  prospectId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    activityType: "note",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `/api/membership-pipeline/${prospectId}/activities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) onCreated();
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Log Activity</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Close</span>×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={form.activityType}
              onChange={(e) =>
                setForm((f) => ({ ...f, activityType: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white"
            >
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="visit">Visit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
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
              {saving ? "Saving..." : "Log Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
