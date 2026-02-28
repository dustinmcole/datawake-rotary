"use client";

import { useEffect, useState, useCallback, useMemo, useRef, forwardRef } from "react";
import {
  Star,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  Mail,
  Phone,
  Globe,
  MapPin,
  Tag,
  Trash2,
  X,
  Search,
  Filter,
  Send,
  PhoneCall,
  Calendar,
  StickyNote,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Users,
  TrendingUp,
  Award,
  Target,
  Loader2,
} from "lucide-react";
import {
  Contact,
  ContactType,
  PipelineStatus,
  SponsorTier,
  Activity,
  ActivityType,
  PIPELINE_STATUS_LABELS,
  SPONSOR_TIER_LABELS,
  ACTIVITY_TYPE_LABELS,
  TEAM_MEMBERS,
} from "@/lib/types";
import { cn, generateId, formatDate, formatDateTime } from "@/lib/utils";

// ============================================
// Constants
// ============================================

const PIPELINE_STAGES: PipelineStatus[] = [
  "lead",
  "contacted",
  "interested",
  "negotiating",
  "committed",
  "confirmed",
];

const PIPELINE_COLORS: Record<PipelineStatus, { bg: string; border: string; text: string; dot: string; header: string }> = {
  lead: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-400", header: "bg-gray-100" },
  contacted: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-400", header: "bg-blue-100" },
  interested: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400", header: "bg-amber-100" },
  negotiating: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-400", header: "bg-purple-100" },
  committed: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400", header: "bg-emerald-100" },
  confirmed: { bg: "bg-gold-50", border: "border-gold-300", text: "text-gold-800", dot: "bg-gold-400", header: "bg-gradient-to-r from-gold-100 to-gold-200" },
};

const SPONSOR_TIER_COLORS: Record<SponsorTier, string> = {
  title: "bg-gradient-to-r from-gold-400 to-gold-600 text-wine-950 font-bold",
  platinum: "bg-slate-200 text-slate-800",
  gold: "bg-gold-100 text-gold-800 border border-gold-300",
  silver: "bg-gray-100 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
  friend: "bg-blue-100 text-blue-700",
};

const TIER_ORDER: SponsorTier[] = ["title", "platinum", "gold", "silver", "bronze", "friend"];

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
  status_change: ArrowRight,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  call: "bg-green-100 text-green-600",
  email: "bg-blue-100 text-blue-600",
  meeting: "bg-purple-100 text-purple-600",
  note: "bg-amber-100 text-amber-600",
  status_change: "bg-wine-100 text-wine-600",
};

const YEAR_OPTIONS: (number | "all")[] = [2013, 2018, 2023, 2024, 2026, "all"];

type ViewMode = "pipeline" | "list" | "grid";

interface SponsorFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  type: ContactType;
  status: PipelineStatus;
  tier: SponsorTier | "";
  assignedTo: string;
  years: string;
  tags: string;
  notes: string;
  publicVisible: boolean;
}

const EMPTY_FORM: SponsorFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  type: "potential_sponsor",
  status: "lead",
  tier: "",
  assignedTo: "Unassigned",
  years: "",
  tags: "",
  notes: "",
  publicVisible: false,
};

// ============================================
// Main Page Component
// ============================================

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [selectedSponsor, setSelectedSponsor] = useState<Contact | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<PipelineStatus | "all">("all");
  const [filterTier, setFilterTier] = useState<SponsorTier | "all">("all");
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>("all");
  const [selectedForEmail, setSelectedForEmail] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [draggedSponsorId, setDraggedSponsorId] = useState<string | null>(null);
  const [newActivityType, setNewActivityType] = useState<ActivityType>("note");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [sortField, setSortField] = useState<string>("company");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const slideoverRef = useRef<HTMLDivElement>(null);

  // Load sponsors on mount
  useEffect(() => {
    async function loadSponsors() {
      try {
        setLoading(true);
        const res = await fetch("/api/contacts?type=sponsor,potential_sponsor");
        if (!res.ok) throw new Error("Failed to load sponsors");
        const data: Contact[] = await res.json();
        setSponsors(data);
      } catch (err) {
        console.error("Error loading sponsors:", err);
        showToast("Failed to load sponsors. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadSponsors();
  }, []);

  // Toast handler
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filtered sponsors
  const filteredSponsors = useMemo(() => {
    return sponsors.filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterYear !== "all" && !c.years.includes(filterYear)) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterTier !== "all" && c.tier !== filterTier) return false;
      if (filterAssignedTo !== "all") {
        const assigned = c.assignedTo || "Unassigned";
        if (assigned !== filterAssignedTo) return false;
      }
      return true;
    });
  }, [sponsors, searchQuery, filterYear, filterStatus, filterTier, filterAssignedTo]);

  // Sorted sponsors (for list view)
  const sortedSponsors = useMemo(() => {
    const sorted = [...filteredSponsors];
    sorted.sort((a, b) => {
      let aVal = "";
      let bVal = "";
      switch (sortField) {
        case "company": aVal = a.company || a.name; bVal = b.company || b.name; break;
        case "tier":
          aVal = String(TIER_ORDER.indexOf(a.tier || "friend"));
          bVal = String(TIER_ORDER.indexOf(b.tier || "friend"));
          break;
        case "status":
          aVal = String(PIPELINE_STAGES.indexOf(a.status));
          bVal = String(PIPELINE_STAGES.indexOf(b.status));
          break;
        case "years":
          aVal = String(Math.max(...(a.years.length ? a.years : [0])));
          bVal = String(Math.max(...(b.years.length ? b.years : [0])));
          break;
        case "email": aVal = a.email; bVal = b.email; break;
        case "assignedTo": aVal = a.assignedTo || ""; bVal = b.assignedTo || ""; break;
        case "lastActivity":
          aVal = a.activities.length ? a.activities[a.activities.length - 1].date : "";
          bVal = b.activities.length ? b.activities[b.activities.length - 1].date : "";
          break;
        default: aVal = a.company || a.name; bVal = b.company || b.name;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredSponsors, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    const byStatus = PIPELINE_STAGES.reduce((acc, s) => {
      acc[s] = sponsors.filter((c) => c.status === s).length;
      return acc;
    }, {} as Record<PipelineStatus, number>);

    const byTier = TIER_ORDER.reduce((acc, t) => {
      acc[t] = sponsors.filter((c) => c.tier === t).length;
      return acc;
    }, {} as Record<SponsorTier, number>);

    return {
      total: sponsors.length,
      byStatus,
      byTier,
      prospects2026: sponsors.filter((c) => c.type === "potential_sponsor").length,
    };
  }, [sponsors]);

  // Pipeline groups
  const pipelineGroups = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = filteredSponsors.filter((c) => c.status === stage);
      return acc;
    }, {} as Record<PipelineStatus, Contact[]>);
  }, [filteredSponsors]);

  // Form handlers
  function openAddModal() {
    setEditingSponsor(null);
    setFormData(EMPTY_FORM);
    setShowFormModal(true);
  }

  function openEditModal(sponsor: Contact) {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      company: sponsor.company,
      email: sponsor.email,
      phone: sponsor.phone,
      website: sponsor.website,
      address: sponsor.address,
      type: sponsor.type,
      status: sponsor.status,
      tier: sponsor.tier || "",
      assignedTo: sponsor.assignedTo || "Unassigned",
      years: sponsor.years.join(", "),
      tags: sponsor.tags.join(", "),
      notes: sponsor.notes,
      publicVisible: sponsor.publicVisible ?? false,
    });
    setShowFormModal(true);
  }

  async function handleSaveSponsor() {
    if (!formData.name.trim()) {
      showToast("Please enter a sponsor name.");
      return;
    }

    const now = new Date().toISOString();
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const years = formData.years
      .split(",")
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => !isNaN(y));

    if (editingSponsor) {
      const oldStatus = editingSponsor.status;
      const newStatus = formData.status;
      const activities = [...editingSponsor.activities];

      if (oldStatus !== newStatus) {
        activities.push({
          id: generateId(),
          type: "status_change",
          description: `Status changed from ${PIPELINE_STATUS_LABELS[oldStatus]} to ${PIPELINE_STATUS_LABELS[newStatus]}`,
          date: now,
          createdBy: "User",
        });
      }

      const changes: Partial<Contact> = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        type: formData.type,
        status: formData.status,
        tier: (formData.tier as SponsorTier) || undefined,
        assignedTo: formData.assignedTo,
        tags,
        years,
        notes: formData.notes,
        activities,
        updatedAt: now,
        publicVisible: formData.publicVisible,
      };

      try {
        const res = await fetch(`/api/contacts/${editingSponsor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });
        if (!res.ok) throw new Error("Failed to update sponsor");
        const updatedContact: Contact = await res.json();
        setSponsors((prev) => prev.map((c) => (c.id === editingSponsor.id ? updatedContact : c)));
        if (selectedSponsor?.id === editingSponsor.id) {
          setSelectedSponsor(updatedContact);
        }
        showToast("Sponsor updated successfully.");
      } catch (err) {
        console.error("Error updating sponsor:", err);
        showToast("Failed to update sponsor. Please try again.");
        return;
      }
    } else {
      const newSponsor: Contact = {
        id: generateId(),
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        type: formData.type,
        status: formData.status,
        tier: (formData.tier as SponsorTier) || undefined,
        assignedTo: formData.assignedTo,
        tags,
        years,
        notes: formData.notes,
        activities: [
          {
            id: generateId(),
            type: "note",
            description: "Sponsor created",
            date: now,
            createdBy: "User",
          },
        ],
        createdAt: now,
        updatedAt: now,
        publicVisible: formData.publicVisible,
      };

      try {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSponsor),
        });
        if (!res.ok) throw new Error("Failed to create sponsor");
        const createdContact: Contact = await res.json();
        setSponsors((prev) => [...prev, createdContact]);
        showToast("Sponsor added successfully.");
      } catch (err) {
        console.error("Error creating sponsor:", err);
        showToast("Failed to add sponsor. Please try again.");
        return;
      }
    }

    setShowFormModal(false);
    setEditingSponsor(null);
    setFormData(EMPTY_FORM);
  }

  async function handleDeleteSponsor(sponsorId: string) {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    try {
      const res = await fetch(`/api/contacts/${sponsorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sponsor");
      setSponsors((prev) => prev.filter((c) => c.id !== sponsorId));
      if (selectedSponsor?.id === sponsorId) setSelectedSponsor(null);
      showToast("Sponsor deleted.");
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      showToast("Failed to delete sponsor. Please try again.");
    }
  }

  // Drag and drop
  function handleDragStart(sponsorId: string) {
    setDraggedSponsorId(sponsorId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent, newStatus: PipelineStatus) {
    e.preventDefault();
    if (!draggedSponsorId) return;

    const sponsor = sponsors.find((c) => c.id === draggedSponsorId);
    if (!sponsor || sponsor.status === newStatus) {
      setDraggedSponsorId(null);
      return;
    }

    const now = new Date().toISOString();
    const newActivities = [
      ...sponsor.activities,
      {
        id: generateId(),
        type: "status_change" as ActivityType,
        description: `Moved from ${PIPELINE_STATUS_LABELS[sponsor.status]} to ${PIPELINE_STATUS_LABELS[newStatus]}`,
        date: now,
        createdBy: "User",
      },
    ];

    setDraggedSponsorId(null);

    try {
      const res = await fetch(`/api/contacts/${draggedSponsorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, updatedAt: now, activities: newActivities }),
      });
      if (!res.ok) throw new Error("Failed to update sponsor status");
      const updatedContact: Contact = await res.json();
      setSponsors((prev) => prev.map((c) => (c.id === draggedSponsorId ? updatedContact : c)));
      if (selectedSponsor?.id === draggedSponsorId) {
        setSelectedSponsor(updatedContact);
      }
      showToast(`Moved to ${PIPELINE_STATUS_LABELS[newStatus]}`);
    } catch (err) {
      console.error("Error updating sponsor status:", err);
      showToast("Failed to move sponsor. Please try again.");
    }
  }

  // Activity log
  async function handleAddActivity() {
    if (!selectedSponsor || !newActivityDesc.trim()) return;
    const now = new Date().toISOString();
    const activity: Activity = {
      id: generateId(),
      type: newActivityType,
      description: newActivityDesc.trim(),
      date: now,
      createdBy: "User",
    };
    const newActivities = [...selectedSponsor.activities, activity];

    try {
      const res = await fetch(`/api/contacts/${selectedSponsor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: newActivities, updatedAt: now }),
      });
      if (!res.ok) throw new Error("Failed to log activity");
      const updatedContact: Contact = await res.json();
      setSponsors((prev) => prev.map((c) => (c.id === selectedSponsor.id ? updatedContact : c)));
      setSelectedSponsor(updatedContact);
      setNewActivityDesc("");
      setShowAddActivity(false);
      showToast("Activity logged.");
    } catch (err) {
      console.error("Error logging activity:", err);
      showToast("Failed to log activity. Please try again.");
    }
  }

  // Update notes on selected sponsor
  async function handleUpdateNotes(notes: string) {
    if (!selectedSponsor) return;
    const now = new Date().toISOString();

    try {
      const res = await fetch(`/api/contacts/${selectedSponsor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, updatedAt: now }),
      });
      if (!res.ok) throw new Error("Failed to update notes");
      const updatedContact: Contact = await res.json();
      setSponsors((prev) => prev.map((c) => (c.id === selectedSponsor.id ? updatedContact : c)));
      setSelectedSponsor(updatedContact);
    } catch (err) {
      console.error("Error updating notes:", err);
      showToast("Failed to save notes. Please try again.");
    }
  }

  // Mass email
  function toggleEmailSelection(sponsorId: string) {
    const next = new Set(selectedForEmail);
    if (next.has(sponsorId)) next.delete(sponsorId);
    else next.add(sponsorId);
    setSelectedForEmail(next);
  }

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) {
      showToast("Please fill in the subject and body.");
      return;
    }
    const now = new Date().toISOString();
    const emailActivity: Activity = {
      id: generateId(),
      type: "email" as ActivityType,
      description: `Email sent: "${emailSubject.trim()}"`,
      date: now,
      createdBy: "User",
    };

    try {
      const updatePromises = sponsors
        .filter((c) => selectedForEmail.has(c.id))
        .map(async (c) => {
          const newActivities = [...c.activities, { ...emailActivity, id: generateId() }];
          const res = await fetch(`/api/contacts/${c.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activities: newActivities, updatedAt: now }),
          });
          if (!res.ok) throw new Error(`Failed to update contact ${c.id}`);
          return res.json() as Promise<Contact>;
        });

      const updatedContacts = await Promise.all(updatePromises);
      const updatedMap = new Map(updatedContacts.map((c) => [c.id, c]));
      setSponsors((prev) => prev.map((c) => updatedMap.get(c.id) ?? c));

      if (selectedSponsor && selectedForEmail.has(selectedSponsor.id)) {
        const refreshed = updatedMap.get(selectedSponsor.id);
        if (refreshed) setSelectedSponsor(refreshed);
      }

      showToast(`Email sent to ${selectedForEmail.size} recipient${selectedForEmail.size > 1 ? "s" : ""}.`);
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
      setSelectedForEmail(new Set());
    } catch (err) {
      console.error("Error sending email:", err);
      showToast("Failed to log email activity. Please try again.");
    }
  }

  // Sort handler
  function handleSort(field: string) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function getLastActivity(sponsor: Contact): string {
    if (!sponsor.activities.length) return "No activity";
    return formatDate(sponsor.activities[sponsor.activities.length - 1].date);
  }

  function getLastActivitySnippet(sponsor: Contact): string {
    if (!sponsor.activities.length) return "No activity yet";
    const last = sponsor.activities[sponsor.activities.length - 1];
    const desc = last.description.length > 60 ? last.description.substring(0, 57) + "..." : last.description;
    return desc;
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-wine-900 text-white shadow-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
            {toast}
          </div>
        </div>
      )}

      {/* Page Header — Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wine-950 via-wine-900 to-wine-950 p-6 mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-gold-400)_0%,_transparent_50%)] opacity-10" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-wine-950" />
              </div>
              <h1 className="text-2xl font-bold text-white">Sponsor Management</h1>
            </div>
            <p className="text-sm text-wine-200 ml-[52px]">
              Cultivate and manage sponsor relationships for Uncorked 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedForEmail.size > 0 && (
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                Email ({selectedForEmail.size})
              </button>
            )}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 text-wine-950 text-sm font-bold hover:from-gold-500 hover:to-gold-600 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Sponsor
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-wine-400 animate-spin" />
            <p className="text-sm text-gray-400">Loading sponsors...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-wine-400" />
              </div>
              <p className="text-xl font-bold text-wine-900">{stats.total}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
            </div>
            {/* Pipeline stages — top 3 */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-gray-600">{stats.byStatus.lead}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Leads</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-blue-600">{stats.byStatus.contacted}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Contacted</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-emerald-600">{stats.byStatus.committed + stats.byStatus.confirmed}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Secured</p>
            </div>
            {/* Tier breakdown — top tiers */}
            <div className="bg-white rounded-xl border border-gold-200 p-3 text-center card-hover">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-gold-500" />
              </div>
              <p className="text-xl font-bold text-gold-700">{stats.byTier.title + stats.byTier.platinum}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Title / Plat</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-gold-600">{stats.byTier.gold}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Gold</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-gray-500">{stats.byTier.silver + stats.byTier.bronze + stats.byTier.friend}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Silver / Brz</p>
            </div>
            {/* 2026 Prospects */}
            <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl border border-gold-300 p-3 text-center card-hover">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-gold-600" />
              </div>
              <p className="text-xl font-bold text-gold-800">{stats.prospects2026}</p>
              <p className="text-[10px] text-gold-700 uppercase tracking-wide font-semibold">2026 Prospects</p>
            </div>
          </div>

          {/* Year Filter Bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Year:</span>
            {YEAR_OPTIONS.map((year) => (
              <button
                key={String(year)}
                onClick={() => setFilterYear(year)}
                className={cn(
                  "px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 min-h-[44px] sm:min-h-0 flex items-center",
                  filterYear === year
                    ? year === 2026
                      ? "bg-gradient-to-r from-gold-400 to-gold-500 text-wine-950 shadow-sm"
                      : "bg-wine-600 text-white shadow-sm"
                    : year === 2026
                      ? "bg-gold-50 text-gold-700 border border-gold-300 hover:bg-gold-100"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {year === "all" ? "All Years" : year}
              </button>
            ))}
          </div>

          {/* Search, Pipeline/Tier Filters, View Toggle */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search */}
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300 min-h-[44px] sm:min-h-0"
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Pipeline filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PipelineStatus | "all")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-h-[44px] sm:min-h-0 bg-white focus:outline-none focus:ring-2 focus:ring-wine-300"
            >
              <option value="all">All Stages</option>
              {Object.entries(PIPELINE_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Tier filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as SponsorTier | "all")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-h-[44px] sm:min-h-0 bg-white focus:outline-none focus:ring-2 focus:ring-wine-300"
            >
              <option value="all">All Tiers</option>
              {Object.entries(SPONSOR_TIER_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Assigned To filter */}
            <select
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-h-[44px] sm:min-h-0 bg-white focus:outline-none focus:ring-2 focus:ring-wine-300"
            >
              <option value="all">All Assignees</option>
              {TEAM_MEMBERS.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(filterYear !== "all" || filterStatus !== "all" || filterTier !== "all" || filterAssignedTo !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setFilterYear("all");
                  setFilterStatus("all");
                  setFilterTier("all");
                  setFilterAssignedTo("all");
                  setSearchQuery("");
                }}
                className="text-xs text-wine-600 hover:text-wine-800 font-medium whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center"
              >
                Clear filters
              </button>
            )}

            </div>{/* end filter row */}

            {/* View toggle */}
            <div className="flex items-center self-end sm:self-auto bg-white border border-gray-200 rounded-lg p-0.5">
              {[
                { mode: "pipeline" as ViewMode, icon: Kanban, label: "Pipeline", hideMobile: true },
                { mode: "list" as ViewMode, icon: List, label: "Table", hideMobile: true },
                { mode: "grid" as ViewMode, icon: LayoutGrid, label: "Cards", hideMobile: false },
              ].map(({ mode, icon: Icon, label, hideMobile }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-colors min-h-[44px] sm:min-h-0",
                    hideMobile && "hidden sm:inline-flex",
                    viewMode === mode
                      ? "bg-wine-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">
              Showing {filteredSponsors.length} of {sponsors.length} sponsors
              {filterYear !== "all" && ` from ${filterYear}`}
            </p>
          </div>

          {/* Views — on mobile (< 640px), always show grid; pipeline/table only on sm+ */}
          {viewMode === "pipeline" && (
            <>
              {/* Pipeline hidden on mobile, shown on sm+ */}
              <div className="hidden sm:block">
                <SponsorPipelineView
                  pipelineGroups={pipelineGroups}
                  onSelectSponsor={setSelectedSponsor}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  draggedSponsorId={draggedSponsorId}
                  selectedForEmail={selectedForEmail}
                  onToggleEmail={toggleEmailSelection}
                  getLastActivitySnippet={getLastActivitySnippet}
                />
              </div>
              {/* Fallback grid on mobile */}
              <div className="sm:hidden">
                <SponsorGridView
                  sponsors={filteredSponsors}
                  onSelectSponsor={setSelectedSponsor}
                  selectedForEmail={selectedForEmail}
                  onToggleEmail={toggleEmailSelection}
                  getLastActivity={getLastActivity}
                />
              </div>
            </>
          )}

          {viewMode === "list" && (
            <>
              {/* Table hidden on mobile, shown on sm+ */}
              <div className="hidden sm:block">
                <SponsorListView
                  sponsors={sortedSponsors}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelectSponsor={setSelectedSponsor}
                  selectedForEmail={selectedForEmail}
                  onToggleEmail={toggleEmailSelection}
                  getLastActivity={getLastActivity}
                />
              </div>
              {/* Fallback grid on mobile */}
              <div className="sm:hidden">
                <SponsorGridView
                  sponsors={filteredSponsors}
                  onSelectSponsor={setSelectedSponsor}
                  selectedForEmail={selectedForEmail}
                  onToggleEmail={toggleEmailSelection}
                  getLastActivity={getLastActivity}
                />
              </div>
            </>
          )}

          {viewMode === "grid" && (
            <SponsorGridView
              sponsors={filteredSponsors}
              onSelectSponsor={setSelectedSponsor}
              selectedForEmail={selectedForEmail}
              onToggleEmail={toggleEmailSelection}
              getLastActivity={getLastActivity}
            />
          )}
        </>
      )}

      {/* Sponsor Detail Slide-over */}
      {selectedSponsor && (
        <SponsorSlideover
          ref={slideoverRef}
          sponsor={selectedSponsor}
          onClose={() => {
            setSelectedSponsor(null);
            setShowAddActivity(false);
            setNewActivityDesc("");
          }}
          onEdit={() => openEditModal(selectedSponsor)}
          onDelete={() => handleDeleteSponsor(selectedSponsor.id)}
          onUpdateNotes={handleUpdateNotes}
          showAddActivity={showAddActivity}
          setShowAddActivity={setShowAddActivity}
          newActivityType={newActivityType}
          setNewActivityType={setNewActivityType}
          newActivityDesc={newActivityDesc}
          setNewActivityDesc={setNewActivityDesc}
          onAddActivity={handleAddActivity}
        />
      )}

      {/* Sponsor Form Modal */}
      {showFormModal && (
        <SponsorFormModal
          formData={formData}
          setFormData={setFormData}
          isEditing={!!editingSponsor}
          onSave={handleSaveSponsor}
          onClose={() => {
            setShowFormModal(false);
            setEditingSponsor(null);
            setFormData(EMPTY_FORM);
          }}
        />
      )}

      {/* Mass Email Modal */}
      {showEmailModal && (
        <EmailComposeModal
          recipients={sponsors.filter((c) => selectedForEmail.has(c.id))}
          subject={emailSubject}
          setSubject={setEmailSubject}
          body={emailBody}
          setBody={setEmailBody}
          onSend={handleSendEmail}
          onClose={() => {
            setShowEmailModal(false);
            setEmailSubject("");
            setEmailBody("");
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Tier Badge Component
// ============================================

function TierBadge({ tier, size = "sm" }: { tier?: SponsorTier; size?: "sm" | "md" }) {
  if (!tier) return null;
  const sizeClass = size === "md" ? "text-[11px] px-2.5 py-0.5" : "text-[10px] px-2 py-0.5";
  return (
    <span className={cn("status-badge inline-flex items-center gap-1", sizeClass, SPONSOR_TIER_COLORS[tier])}>
      {tier === "title" && <Star className="w-3 h-3" />}
      {SPONSOR_TIER_LABELS[tier]}
    </span>
  );
}

// ============================================
// Year Tags Component
// ============================================

function YearTags({ years, size = "sm" }: { years: number[]; size?: "sm" | "md" }) {
  if (!years.length) return null;
  const sorted = [...years].sort((a, b) => b - a);
  const sizeClass = size === "md" ? "text-[11px] px-2 py-0.5" : "text-[9px] px-1.5 py-0.5";
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {sorted.map((year) => (
        <span
          key={year}
          className={cn(
            "rounded-full font-semibold inline-block",
            sizeClass,
            year === 2026
              ? "bg-gold-100 text-gold-800 border border-gold-300"
              : "bg-wine-100 text-wine-700"
          )}
        >
          {year}
        </span>
      ))}
    </div>
  );
}

// ============================================
// Pipeline View (Kanban)
// ============================================

function SponsorPipelineView({
  pipelineGroups,
  onSelectSponsor,
  onDragStart,
  onDragOver,
  onDrop,
  draggedSponsorId,
  selectedForEmail,
  onToggleEmail,
  getLastActivitySnippet,
}: {
  pipelineGroups: Record<PipelineStatus, Contact[]>;
  onSelectSponsor: (c: Contact) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: PipelineStatus) => void;
  draggedSponsorId: string | null;
  selectedForEmail: Set<string>;
  onToggleEmail: (id: string) => void;
  getLastActivitySnippet: (c: Contact) => string;
}) {
  const totalSponsors = Object.values(pipelineGroups).reduce((sum, arr) => sum + arr.length, 0);

  if (totalSponsors === 0) {
    return <EmptyState message="No sponsors match your current filters. Try adjusting your year or tier selection." />;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {PIPELINE_STAGES.map((stage) => {
        const colors = PIPELINE_COLORS[stage];
        const stageSponsors = pipelineGroups[stage];
        return (
          <div
            key={stage}
            className={cn(
              "flex-shrink-0 w-[270px] rounded-xl border kanban-column flex flex-col",
              colors.border,
              draggedSponsorId ? "transition-colors" : ""
            )}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage)}
          >
            {/* Column header */}
            <div className={cn("rounded-t-xl px-3 py-2.5 flex items-center justify-between", colors.header)}>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                <span className={cn("text-sm font-semibold", colors.text)}>
                  {PIPELINE_STATUS_LABELS[stage]}
                </span>
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                colors.bg, colors.text
              )}>
                {stageSponsors.length}
              </span>
            </div>

            {/* Column body */}
            <div className={cn("flex-1 p-2 space-y-2", colors.bg)}>
              {stageSponsors.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  Drop sponsors here
                </div>
              )}
              {stageSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  draggable
                  onDragStart={() => onDragStart(sponsor.id)}
                  onClick={() => onSelectSponsor(sponsor)}
                  className={cn(
                    "bg-white rounded-lg p-3 border border-gray-100 cursor-pointer card-hover group relative",
                    draggedSponsorId === sponsor.id && "opacity-50 ring-2 ring-wine-400"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {sponsor.company || sponsor.name}
                      </p>
                      {sponsor.company && sponsor.company !== sponsor.name && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0" />
                          {sponsor.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEmail(sponsor.id);
                      }}
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                        selectedForEmail.has(sponsor.id)
                          ? "bg-wine-600 border-wine-600 text-white"
                          : "border-gray-300 hover:border-wine-400"
                      )}
                    >
                      {selectedForEmail.has(sponsor.id) && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Tier badge */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <TierBadge tier={sponsor.tier} />
                  </div>

                  {/* Year tags */}
                  {sponsor.years.length > 0 && (
                    <div className="mb-2">
                      <YearTags years={sponsor.years} />
                    </div>
                  )}

                  {/* Assigned To */}
                  {sponsor.assignedTo && sponsor.assignedTo !== "Unassigned" && (
                    <p className="text-[10px] text-wine-500 truncate mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 shrink-0" />
                      {sponsor.assignedTo}
                    </p>
                  )}

                  {/* Last activity snippet */}
                  <p className="text-[10px] text-gray-400 truncate">
                    {getLastActivitySnippet(sponsor)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Table (List) View
// ============================================

function SponsorListView({
  sponsors,
  sortField,
  sortDirection,
  onSort,
  onSelectSponsor,
  selectedForEmail,
  onToggleEmail,
  getLastActivity,
}: {
  sponsors: Contact[];
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onSelectSponsor: (c: Contact) => void;
  selectedForEmail: Set<string>;
  onToggleEmail: (id: string) => void;
  getLastActivity: (c: Contact) => string;
}) {
  if (sponsors.length === 0) {
    return <EmptyState message="No sponsors match your filters. Try adjusting your search or filters." />;
  }

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <th
      className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-gray-500 cursor-pointer hover:text-wine-600 select-none"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-wine-600">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="w-10 px-4 py-3" />
              <SortHeader field="company" label="Company" />
              <SortHeader field="tier" label="Tier" />
              <SortHeader field="status" label="Status" />
              <SortHeader field="years" label="Years" />
              <SortHeader field="assignedTo" label="Assigned To" />
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-gray-500">Contact Info</th>
              <SortHeader field="lastActivity" label="Last Activity" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sponsors.map((sponsor) => (
              <tr
                key={sponsor.id}
                className="hover:bg-cream-50 cursor-pointer transition-colors"
                onClick={() => onSelectSponsor(sponsor)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleEmail(sponsor.id)}
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      selectedForEmail.has(sponsor.id)
                        ? "bg-wine-600 border-wine-600 text-white"
                        : "border-gray-300 hover:border-wine-400"
                    )}
                  >
                    {selectedForEmail.has(sponsor.id) && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{sponsor.company || sponsor.name}</span>
                    {sponsor.company && sponsor.company !== sponsor.name && (
                      <p className="text-xs text-gray-400">{sponsor.name}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={sponsor.tier} />
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "status-badge text-[10px]",
                    PIPELINE_COLORS[sponsor.status].bg,
                    PIPELINE_COLORS[sponsor.status].text,
                    PIPELINE_COLORS[sponsor.status].border
                  )}>
                    {PIPELINE_STATUS_LABELS[sponsor.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <YearTags years={sponsor.years} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600">
                    {sponsor.assignedTo && sponsor.assignedTo !== "Unassigned" ? sponsor.assignedTo : <span className="text-gray-300">-</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5 text-xs text-gray-500">
                    {sponsor.email && (
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0 text-gray-400" />
                        {sponsor.email}
                      </div>
                    )}
                    {sponsor.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                        {sponsor.phone}
                      </div>
                    )}
                    {!sponsor.email && !sponsor.phone && (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{getLastActivity(sponsor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Card Grid View
// ============================================

function SponsorGridView({
  sponsors,
  onSelectSponsor,
  selectedForEmail,
  onToggleEmail,
  getLastActivity,
}: {
  sponsors: Contact[];
  onSelectSponsor: (c: Contact) => void;
  selectedForEmail: Set<string>;
  onToggleEmail: (id: string) => void;
  getLastActivity: (c: Contact) => string;
}) {
  if (sponsors.length === 0) {
    return <EmptyState message="No sponsors match your filters. Try adjusting your search or filters." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          onClick={() => onSelectSponsor(sponsor)}
          className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer card-hover relative group"
        >
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleEmail(sponsor.id);
            }}
            className={cn(
              "absolute top-3 right-3 w-5 h-5 rounded border flex items-center justify-center transition-colors",
              selectedForEmail.has(sponsor.id)
                ? "bg-wine-600 border-wine-600 text-white"
                : "border-gray-300 opacity-0 group-hover:opacity-100 hover:border-wine-400"
            )}
          >
            {selectedForEmail.has(sponsor.id) && <CheckCircle2 className="w-3 h-3" />}
          </button>

          {/* Avatar with tier-based color */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-3",
            sponsor.tier === "title" ? "bg-gradient-to-br from-gold-300 to-gold-500" :
            sponsor.tier === "platinum" ? "bg-gradient-to-br from-slate-200 to-slate-400" :
            sponsor.tier === "gold" ? "bg-gradient-to-br from-gold-100 to-gold-300" :
            "bg-gradient-to-br from-wine-100 to-wine-200"
          )}>
            <span className={cn(
              "text-sm font-bold",
              sponsor.tier === "title" ? "text-wine-950" :
              sponsor.tier === "platinum" ? "text-slate-800" :
              sponsor.tier === "gold" ? "text-gold-800" :
              "text-wine-700"
            )}>
              {(sponsor.company || sponsor.name).charAt(0).toUpperCase()}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
            {sponsor.company || sponsor.name}
          </h3>
          {sponsor.company && sponsor.company !== sponsor.name && (
            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mb-2">
              <Building2 className="w-3 h-3 shrink-0" />
              {sponsor.name}
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <TierBadge tier={sponsor.tier} />
            <span className={cn(
              "status-badge text-[10px]",
              PIPELINE_COLORS[sponsor.status].bg,
              PIPELINE_COLORS[sponsor.status].text,
              PIPELINE_COLORS[sponsor.status].border
            )}>
              {PIPELINE_STATUS_LABELS[sponsor.status]}
            </span>
          </div>

          {/* Year tags */}
          {sponsor.years.length > 0 && (
            <div className="mb-3">
              <YearTags years={sponsor.years} />
            </div>
          )}

          <div className="space-y-1 text-xs text-gray-500">
            {sponsor.email && (
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                {sponsor.email}
              </div>
            )}
            {sponsor.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 shrink-0" />
                {sponsor.phone}
              </div>
            )}
            {sponsor.assignedTo && sponsor.assignedTo !== "Unassigned" && (
              <div className="flex items-center gap-1.5 text-wine-500">
                <Users className="w-3 h-3 shrink-0" />
                {sponsor.assignedTo}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{sponsor.tier ? SPONSOR_TIER_LABELS[sponsor.tier] : "-"}</span>
            <span className="text-[10px] text-gray-400">{getLastActivity(sponsor)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Sponsor Detail Slide-over
// ============================================

const SponsorSlideover = forwardRef<HTMLDivElement, {
  sponsor: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateNotes: (notes: string) => void;
  showAddActivity: boolean;
  setShowAddActivity: (show: boolean) => void;
  newActivityType: ActivityType;
  setNewActivityType: (type: ActivityType) => void;
  newActivityDesc: string;
  setNewActivityDesc: (desc: string) => void;
  onAddActivity: () => void;
}>(function SponsorSlideoverInner(
  {
    sponsor,
    onClose,
    onEdit,
    onDelete,
    onUpdateNotes,
    showAddActivity,
    setShowAddActivity,
    newActivityType,
    setNewActivityType,
    newActivityDesc,
    setNewActivityDesc,
    onAddActivity,
  },
  ref
) {
  const sortedActivities = [...sponsor.activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 modal-overlay" onClick={onClose} />

      {/* Panel — full-screen on mobile, sidebar on sm+ */}
      <div
        ref={ref}
        className="fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 z-50 w-full sm:max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in"
        style={{ animationName: "slideInRight" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-wine-950 via-wine-900 to-wine-800 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-gold-400)_0%,_transparent_50%)] opacity-10" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="px-3 py-2 sm:py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors min-h-[44px] sm:min-h-0 flex items-center"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-wine-200 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                sponsor.tier === "title" ? "bg-gradient-to-br from-gold-300 to-gold-500" : "bg-white/10"
              )}>
                <span className={cn(
                  "text-lg font-bold",
                  sponsor.tier === "title" ? "text-wine-950" : "text-gold-400"
                )}>
                  {(sponsor.company || sponsor.name).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{sponsor.company || sponsor.name}</h2>
                {sponsor.company && sponsor.company !== sponsor.name && (
                  <p className="text-wine-200 text-sm flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {sponsor.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <TierBadge tier={sponsor.tier} size="md" />
              <span className={cn(
                "status-badge text-[11px]",
                PIPELINE_COLORS[sponsor.status].bg,
                PIPELINE_COLORS[sponsor.status].text
              )}>
                {PIPELINE_STATUS_LABELS[sponsor.status]}
              </span>
              <span className="status-badge text-[11px] bg-white/20 text-white">
                {sponsor.type === "sponsor" ? "Sponsor" : "Prospect"}
              </span>
            </div>
            {sponsor.assignedTo && sponsor.assignedTo !== "Unassigned" && (
              <div className="flex items-center gap-2 mt-3 text-wine-200 text-sm">
                <Users className="w-4 h-4 shrink-0" />
                <span>Assigned to <strong className="text-white">{sponsor.assignedTo}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Contact Details</h3>
            <div className="space-y-2.5">
              {sponsor.email && (
                <div className="flex items-center gap-3 text-sm min-h-[44px] sm:min-h-0">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${sponsor.email}`} className="text-wine-600 hover:text-wine-800 hover:underline py-2 sm:py-0">
                    {sponsor.email}
                  </a>
                </div>
              )}
              {sponsor.phone && (
                <div className="flex items-center gap-3 text-sm min-h-[44px] sm:min-h-0">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:${sponsor.phone}`} className="text-gray-700 hover:text-wine-700 py-2 sm:py-0">
                    {sponsor.phone}
                  </a>
                </div>
              )}
              {sponsor.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={sponsor.website.startsWith("http") ? sponsor.website : `https://${sponsor.website}`} target="_blank" rel="noopener noreferrer" className="text-wine-600 hover:text-wine-800 hover:underline truncate">
                    {sponsor.website}
                  </a>
                </div>
              )}
              {sponsor.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700">{sponsor.address}</span>
                </div>
              )}
              {sponsor.tags.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <Tag className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {sponsor.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-cream-100 text-wine-700 text-[11px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!sponsor.email && !sponsor.phone && !sponsor.website && !sponsor.address && sponsor.tags.length === 0 && (
                <p className="text-sm text-gray-400 italic">No contact details added yet.</p>
              )}
            </div>
          </div>

          {/* Year History */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Year History</h3>
            {sponsor.years.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {[...sponsor.years].sort((a, b) => b - a).map((year) => (
                  <span
                    key={year}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold",
                      year === 2026
                        ? "bg-gradient-to-r from-gold-100 to-gold-200 text-gold-800 border border-gold-300 shadow-sm"
                        : "bg-wine-50 text-wine-700 border border-wine-200"
                    )}
                  >
                    {year}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No year history recorded.</p>
            )}
          </div>

          {/* Notes */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Notes</h3>
            <textarea
              value={sponsor.notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add notes about this sponsor..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300 bg-cream-50"
            />
          </div>

          {/* Activity Log */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Activity Log</h3>
              <button
                onClick={() => setShowAddActivity(!showAddActivity)}
                className="inline-flex items-center gap-1 text-xs font-medium text-wine-600 hover:text-wine-800 transition-colors min-h-[44px] sm:min-h-0 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Activity
              </button>
            </div>

            {/* Add Activity Form */}
            {showAddActivity && (
              <div className="mb-4 p-4 bg-cream-50 rounded-xl border border-cream-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-wine-300"
                  >
                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  placeholder="Describe the activity..."
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-wine-300 bg-white mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAddActivity(false);
                      setNewActivityDesc("");
                    }}
                    className="px-3 py-2 sm:py-1.5 text-sm text-gray-500 hover:text-gray-700 min-h-[44px] sm:min-h-0"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onAddActivity}
                    disabled={!newActivityDesc.trim()}
                    className="px-3 py-2 sm:py-1.5 text-sm bg-wine-600 text-white rounded-lg hover:bg-wine-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Timeline */}
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-4">No activity recorded yet.</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />

                <div className="space-y-4">
                  {sortedActivities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type];
                    const colorClass = ACTIVITY_COLORS[activity.type];
                    return (
                      <div key={activity.id} className="flex gap-3 relative">
                        {/* Icon */}
                        <div className={cn(
                          "w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10",
                          colorClass
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              {ACTIVITY_TYPE_LABELS[activity.type]}
                            </span>
                            <span className="text-[10px] text-gray-300">&middot;</span>
                            <span className="text-[10px] text-gray-400">
                              {formatDateTime(activity.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{activity.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">by {activity.createdBy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

// ============================================
// Sponsor Form Modal
// ============================================

function SponsorFormModal({
  formData,
  setFormData,
  isEditing,
  onSave,
  onClose,
}: {
  formData: SponsorFormData;
  setFormData: (data: SponsorFormData) => void;
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 modal-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 sm:rounded-t-2xl flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-wine-950">
              {isEditing ? "Edit Sponsor" : "Add New Sponsor"}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sponsor name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                />
              </div>
            </div>

            {/* Website & Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, City, State"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ContactType })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                >
                  <option value="sponsor">Sponsor</option>
                  <option value="potential_sponsor">Potential Sponsor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pipeline Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PipelineStatus })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                >
                  {Object.entries(PIPELINE_STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sponsor Tier & Assigned To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sponsor Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as SponsorTier | "" })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                >
                  <option value="">Select tier...</option>
                  {Object.entries(SPONSOR_TIER_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                >
                  {TEAM_MEMBERS.map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Years */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Years</label>
              <input
                type="text"
                value={formData.years}
                onChange={(e) => setFormData({ ...formData, years: e.target.value })}
                placeholder="Comma-separated (e.g. 2018, 2024, 2026)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
              <p className="text-[10px] text-gray-400 mt-1">Years this sponsor participated (comma-separated)</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated (e.g. multi-year, diamond, local)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
            </div>

            {/* Public Visibility */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="publicVisible"
                checked={formData.publicVisible}
                onChange={(e) => setFormData({ ...formData, publicVisible: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-wine-600 focus:ring-wine-400 cursor-pointer"
              />
              <label htmlFor="publicVisible" className="text-sm text-gray-700 cursor-pointer select-none">
                Show on public website
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 sm:rounded-b-2xl flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-sm text-gray-600 hover:text-gray-800 font-medium min-h-[44px] sm:min-h-0"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-5 py-2.5 sm:py-2 bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-medium rounded-lg hover:from-wine-700 hover:to-wine-800 transition-all shadow-sm min-h-[44px] sm:min-h-0"
            >
              {isEditing ? "Save Changes" : "Add Sponsor"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Email Compose Modal
// ============================================

function EmailComposeModal({
  recipients,
  subject,
  setSubject,
  body,
  setBody,
  onSend,
  onClose,
}: {
  recipients: Contact[];
  subject: string;
  setSubject: (s: string) => void;
  body: string;
  setBody: (b: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 modal-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl pointer-events-auto animate-fade-in flex flex-col h-full sm:h-auto sm:max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 sm:rounded-t-2xl flex items-center justify-between bg-gradient-to-r from-wine-900 to-wine-800 text-white">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-bold">Compose Email</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recipients */}
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 shrink-0">To:</span>
              <div className="flex flex-wrap gap-1.5">
                {recipients.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-wine-100 text-wine-700 text-xs font-medium"
                  >
                    <span className="w-4 h-4 rounded-full bg-wine-200 flex items-center justify-center text-[9px] font-bold text-wine-800">
                      {(r.company || r.name).charAt(0).toUpperCase()}
                    </span>
                    {r.company || r.name}
                    {r.email && (
                      <span className="text-wine-400 ml-0.5">&lt;{r.email}&gt;</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="flex-1 text-sm border-none outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="w-full h-full min-h-[200px] text-sm border-none outline-none resize-none bg-transparent text-gray-700 placeholder:text-gray-400 leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 sm:rounded-b-2xl flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-400 hidden sm:block">
              {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 sm:py-2 text-sm text-gray-600 hover:text-gray-800 font-medium min-h-[44px] sm:min-h-0"
              >
                Discard
              </button>
              <button
                onClick={onSend}
                disabled={!subject.trim() || !body.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-2 bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-medium rounded-lg hover:from-wine-700 hover:to-wine-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-wine-50 flex items-center justify-center mb-4">
        <Star className="w-8 h-8 text-wine-300" />
      </div>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
    </div>
  );
}
