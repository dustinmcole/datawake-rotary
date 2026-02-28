"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Loader2,
  Mail,
  Phone,
  Globe,
  Building2,
  User,
  Calendar,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Submission = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  website: string;
  description: string;
  previousParticipant: boolean;
  processed: boolean;
  contactId: string | null;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorInterestPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "processed">("all");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor-interest");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSubmissions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert(submission: Submission) {
    setConverting(submission.id);
    try {
      const res = await fetch(`/api/vendor-interest/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert" }),
      });
      if (res.ok) {
        const updated: Submission = await res.json();
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submission.id ? updated : s))
        );
        if (selected?.id === submission.id) setSelected(updated);
      }
    } finally {
      setConverting(null);
    }
  }

  const filtered = submissions.filter((s) => {
    if (filter === "new") return !s.processed;
    if (filter === "processed") return s.processed;
    return true;
  });

  const newCount = submissions.filter((s) => !s.processed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-wine-400" />
        <span className="ml-3 text-gray-500">Loading submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine-600 to-wine-800 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-wine-950">Vendor Interest</h1>
            <p className="text-sm text-gray-500">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} &middot;{" "}
              {newCount} new
            </p>
          </div>
        </div>
        <button
          onClick={loadSubmissions}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(["all", "new", "processed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-white text-wine-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f === "new" ? `New (${newCount})` : f === "all" ? `All (${submissions.length})` : `Processed (${submissions.length - newCount})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-wine-100 to-wine-200 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-wine-400" />
          </div>
          <h2 className="text-xl font-bold text-wine-900 mb-2">
            {filter === "new" ? "No new submissions" : filter === "processed" ? "No processed submissions" : "No submissions yet"}
          </h2>
          <p className="text-sm text-gray-500 max-w-sm text-center">
            {filter === "all"
              ? "Vendor interest form submissions from the public website will appear here."
              : "Try switching the filter above."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((submission) => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              converting={converting === submission.id}
              onView={() => setSelected(submission)}
              onConvert={() => handleConvert(submission)}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-overlay animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wine-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-wine-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selected.businessName}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selected.processed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Converted to Lead
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        New
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 capitalize">{selected.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Contact info */}
              <div className="grid grid-cols-1 gap-3">
                <InfoRow icon={<User className="w-4 h-4 text-gray-400" />} label="Contact" value={selected.contactName} />
                <InfoRow icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email" value={selected.email} href={`mailto:${selected.email}`} />
                {selected.phone && (
                  <InfoRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone" value={selected.phone} href={`tel:${selected.phone}`} />
                )}
                {selected.website && (
                  <InfoRow icon={<Globe className="w-4 h-4 text-gray-400" />} label="Website" value={selected.website} href={selected.website} external />
                )}
                <InfoRow icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Submitted" value={formatDate(selected.createdAt)} />
              </div>

              {/* Previous participant */}
              {selected.previousParticipant && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-50 border border-gold-200/60">
                  <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                  <span className="text-sm text-gold-800 font-medium">Previously participated in Fullerton Uncorked</span>
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{selected.description}</p>
                </div>
              )}

              {/* Linked contact */}
              {selected.contactId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-emerald-800">
                    Converted — contact ID: <span className="font-mono text-xs">{selected.contactId}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {!selected.processed && (
                <button
                  onClick={() => handleConvert(selected)}
                  disabled={converting === selected.id}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-semibold shadow-sm hover:from-wine-700 hover:to-wine-800 transition-all disabled:opacity-60"
                >
                  {converting === selected.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  Convert to Vendor Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SubmissionRow({
  submission,
  converting,
  onView,
  onConvert,
}: {
  submission: Submission;
  converting: boolean;
  onView: () => void;
  onConvert: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl bg-white border card-hover cursor-pointer",
        submission.processed ? "border-gray-100" : "border-amber-200/60 bg-amber-50/30"
      )}
      onClick={onView}
    >
      {/* Status indicator */}
      <div className={cn(
        "w-2 h-2 rounded-full shrink-0",
        submission.processed ? "bg-gray-300" : "bg-amber-400"
      )} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{submission.businessName}</span>
          {submission.previousParticipant && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium border border-gold-200/60">
              Past Participant
            </span>
          )}
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
            {submission.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {submission.contactName} &middot; {submission.email} &middot; {formatDate(submission.createdAt)}
        </p>
      </div>

      {/* Status badge */}
      {submission.processed ? (
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          Converted
        </span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvert();
          }}
          disabled={converting}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-wine-600 text-white text-xs font-semibold hover:bg-wine-700 transition-colors disabled:opacity-60 shrink-0"
        >
          {converting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
          Convert
        </button>
      )}

      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-wine-500 transition-colors shrink-0" />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={cn("text-sm text-gray-800 break-words", href && "text-wine-600 hover:underline")}>{value}</p>
      </div>
      {external && href && <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />}
    </div>
  );

  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} onClick={(e) => e.stopPropagation()}>
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}
