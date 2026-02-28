"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Store,
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
  ChevronRight,
  Search,
  Filter,
  Send,
  MessageSquare,
  PhoneCall,
  Calendar,
  StickyNote,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  UtensilsCrossed,
  Beer,
  Wine,
  Music,
  Wrench,
  GripVertical,
  User,
  Loader2,
} from "lucide-react";
import {
  Contact,
  PipelineStatus,
  VendorCategory,
  Activity,
  ActivityType,
  PIPELINE_STATUS_LABELS,
  VENDOR_CATEGORY_LABELS,
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
  confirmed: { bg: "bg-wine-50", border: "border-wine-200", text: "text-wine-700", dot: "bg-gold-400", header: "bg-wine-100" },
};

const VENDOR_CATEGORY_COLORS: Record<VendorCategory, string> = {
  food: "bg-orange-100 text-orange-800",
  beer: "bg-amber-100 text-amber-800",
  wine: "bg-wine-100 text-wine-800",
  entertainment: "bg-purple-100 text-purple-800",
  services: "bg-blue-100 text-blue-800",
};

const VENDOR_CATEGORY_ICONS: Record<VendorCategory, React.ComponentType<{ className?: string }>> = {
  food: UtensilsCrossed,
  beer: Beer,
  wine: Wine,
  entertainment: Music,
  services: Wrench,
};

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

const YEAR_OPTIONS = [2013, 2018, 2019, 2022, 2023, 2024, 2026] as const;

const VENDOR_CATEGORIES: VendorCategory[] = ["food", "beer", "wine", "entertainment", "services"];

type ViewMode = "pipeline" | "list" | "grid";

interface VendorFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  type: "vendor" | "potential_vendor";
  status: PipelineStatus;
  vendorCategory: VendorCategory | "";
  assignedTo: string;
  years: string;
  tags: string;
  notes: string;
  publicVisible: boolean;
}

const EMPTY_FORM: VendorFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  type: "potential_vendor",
  status: "lead",
  vendorCategory: "",
  assignedTo: "Unassigned",
  years: "",
  tags: "",
  notes: "",
  publicVisible: false,
};

// ============================================
// Year Tag Component
// ============================================
function YearTag({ year }: { year: number }) {
  const is2026 = year === 2026;
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none",
        is2026
          ? "bg-gold-100 text-gold-800 border border-gold-300"
          : "bg-wine-100 text-wine-700"
      )}
    >
      {year}
    </span>
  );
}

// ============================================
// Category Badge Component
// ============================================
function CategoryBadge({ category, size = "sm" }: { category: VendorCategory; size?: "sm" | "md" }) {
  const Icon = VENDOR_CATEGORY_ICONS[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        VENDOR_CATEGORY_COLORS[category],
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {VENDOR_CATEGORY_LABELS[category]}
    </span>
  );
}

// ============================================
// Status Badge Component
// ============================================
function StatusBadge({ status }: { status: PipelineStatus }) {
  const colors = PIPELINE_COLORS[status];
  return (
    <span className={cn("status-badge", colors.bg, colors.text, "border", colors.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      {PIPELINE_STATUS_LABELS[status]}
    </span>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [selectedVendor, setSelectedVendor] = useState<Contact | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterCategory, setFilterCategory] = useState<VendorCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<PipelineStatus | "all">("all");
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>("all");
  const [selectedForEmail, setSelectedForEmail] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [draggedVendorId, setDraggedVendorId] = useState<string | null>(null);
  const [newActivityType, setNewActivityType] = useState<ActivityType>("note");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const slideoverRef = useRef<HTMLDivElement>(null);

  // Load vendors on mount
  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await fetch("/api/contacts?type=vendor,potential_vendor");
        if (!res.ok) throw new Error(`Failed to load vendors: ${res.status}`);
        const data = await res.json();
        setVendors(data);
      } catch (err) {
        console.error("Error loading vendors:", err);
        showToast("Failed to load vendors. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  // Force grid view on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) setViewMode("grid");
    }
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Toast handler
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          v.name.toLowerCase().includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterYear !== "all" && !v.years.includes(filterYear)) return false;
      if (filterCategory !== "all" && v.vendorCategory !== filterCategory) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (filterAssignedTo !== "all") {
        const assignee = v.assignedTo || "Unassigned";
        if (assignee !== filterAssignedTo) return false;
      }
      return true;
    });
  }, [vendors, searchQuery, filterYear, filterCategory, filterStatus, filterAssignedTo]);

  // Sorted vendors (for list view)
  const sortedVendors = useMemo(() => {
    const sorted = [...filteredVendors];
    sorted.sort((a, b) => {
      let aVal = "";
      let bVal = "";
      switch (sortField) {
        case "name": aVal = a.name; bVal = b.name; break;
        case "category": aVal = a.vendorCategory || ""; bVal = b.vendorCategory || ""; break;
        case "status": aVal = a.status; bVal = b.status; break;
        case "assignedTo": aVal = a.assignedTo || ""; bVal = b.assignedTo || ""; break;
        case "years": aVal = (a.years || []).sort().join(","); bVal = (b.years || []).sort().join(","); break;
        case "location": aVal = a.address; bVal = b.address; break;
        case "contact": aVal = a.email || a.phone; bVal = b.email || b.phone; break;
        case "lastActivity":
          aVal = a.activities.length ? a.activities[a.activities.length - 1].date : "";
          bVal = b.activities.length ? b.activities[b.activities.length - 1].date : "";
          break;
        default: aVal = a.name; bVal = b.name;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredVendors, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: vendors.length,
      food: vendors.filter((v) => v.vendorCategory === "food").length,
      beer: vendors.filter((v) => v.vendorCategory === "beer").length,
      wine: vendors.filter((v) => v.vendorCategory === "wine").length,
      entertainment: vendors.filter((v) => v.vendorCategory === "entertainment").length,
      services: vendors.filter((v) => v.vendorCategory === "services").length,
      byStatus: PIPELINE_STAGES.reduce((acc, s) => {
        acc[s] = vendors.filter((v) => v.status === s).length;
        return acc;
      }, {} as Record<PipelineStatus, number>),
      prospects2026: vendors.filter((v) => v.type === "potential_vendor").length,
    };
  }, [vendors]);

  // Pipeline groups
  const pipelineGroups = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = filteredVendors.filter((v) => v.status === stage);
      return acc;
    }, {} as Record<PipelineStatus, Contact[]>);
  }, [filteredVendors]);

  // Category groups (for card grid)
  const categoryGroups = useMemo(() => {
    return VENDOR_CATEGORIES.reduce((acc, cat) => {
      const group = filteredVendors.filter((v) => v.vendorCategory === cat);
      if (group.length > 0) acc[cat] = group;
      return acc;
    }, {} as Partial<Record<VendorCategory, Contact[]>>);
  }, [filteredVendors]);

  // Form handlers
  function openAddModal() {
    setEditingVendor(null);
    setFormData(EMPTY_FORM);
    setShowVendorModal(true);
  }

  function openEditModal(vendor: Contact) {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      company: vendor.company,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website,
      address: vendor.address,
      type: vendor.type as "vendor" | "potential_vendor",
      status: vendor.status,
      vendorCategory: vendor.vendorCategory || "",
      assignedTo: vendor.assignedTo || "Unassigned",
      years: (vendor.years || []).join(", "),
      tags: vendor.tags.join(", "),
      notes: vendor.notes,
      publicVisible: vendor.publicVisible ?? false,
    });
    setShowVendorModal(true);
  }

  async function handleSaveVendor() {
    if (!formData.name.trim()) {
      showToast("Please enter a vendor name.");
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

    if (editingVendor) {
      const oldStatus = editingVendor.status;
      const newStatus = formData.status;
      const activities = [...editingVendor.activities];

      if (oldStatus !== newStatus) {
        activities.push({
          id: generateId(),
          type: "status_change",
          description: `Status changed from ${PIPELINE_STATUS_LABELS[oldStatus]} to ${PIPELINE_STATUS_LABELS[newStatus]}`,
          date: now,
          createdBy: "User",
        });
      }

      const changes = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        type: formData.type,
        status: formData.status,
        vendorCategory: (formData.vendorCategory as VendorCategory) || undefined,
        assignedTo: formData.assignedTo,
        tags,
        years,
        notes: formData.notes,
        publicVisible: formData.publicVisible,
        activities,
        updatedAt: now,
      };

      try {
        const res = await fetch(`/api/contacts/${editingVendor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });
        if (!res.ok) throw new Error(`Failed to update vendor: ${res.status}`);
        const updatedContact: Contact = await res.json();
        setVendors((prev) => prev.map((v) => (v.id === editingVendor.id ? updatedContact : v)));
        if (selectedVendor?.id === editingVendor.id) {
          setSelectedVendor(updatedContact);
        }
        showToast("Vendor updated successfully.");
      } catch (err) {
        console.error("Error updating vendor:", err);
        showToast("Failed to update vendor. Please try again.");
        return;
      }
    } else {
      const newVendor: Omit<Contact, "id"> = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        type: formData.type,
        status: formData.status,
        vendorCategory: (formData.vendorCategory as VendorCategory) || undefined,
        assignedTo: formData.assignedTo,
        tags,
        years,
        notes: formData.notes,
        publicVisible: formData.publicVisible,
        activities: [
          {
            id: generateId(),
            type: "note",
            description: "Vendor created",
            date: now,
            createdBy: "User",
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      try {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newVendor),
        });
        if (!res.ok) throw new Error(`Failed to create vendor: ${res.status}`);
        const createdContact: Contact = await res.json();
        setVendors((prev) => [...prev, createdContact]);
        showToast("Vendor added successfully.");
      } catch (err) {
        console.error("Error creating vendor:", err);
        showToast("Failed to add vendor. Please try again.");
        return;
      }
    }

    setShowVendorModal(false);
    setEditingVendor(null);
    setFormData(EMPTY_FORM);
  }

  async function handleDeleteVendor(vendorId: string) {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const res = await fetch(`/api/contacts/${vendorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete vendor: ${res.status}`);
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      if (selectedVendor?.id === vendorId) setSelectedVendor(null);
      showToast("Vendor deleted.");
    } catch (err) {
      console.error("Error deleting vendor:", err);
      showToast("Failed to delete vendor. Please try again.");
    }
  }

  // Drag and drop
  function handleDragStart(vendorId: string) {
    setDraggedVendorId(vendorId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent, newStatus: PipelineStatus) {
    e.preventDefault();
    if (!draggedVendorId) return;

    const vendor = vendors.find((v) => v.id === draggedVendorId);
    if (!vendor || vendor.status === newStatus) {
      setDraggedVendorId(null);
      return;
    }

    const now = new Date().toISOString();
    const changes = {
      status: newStatus,
      updatedAt: now,
      activities: [
        ...vendor.activities,
        {
          id: generateId(),
          type: "status_change" as ActivityType,
          description: `Moved from ${PIPELINE_STATUS_LABELS[vendor.status]} to ${PIPELINE_STATUS_LABELS[newStatus]}`,
          date: now,
          createdBy: "User",
        },
      ],
    };

    setDraggedVendorId(null);

    try {
      const res = await fetch(`/api/contacts/${draggedVendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error(`Failed to update vendor status: ${res.status}`);
      const updatedContact: Contact = await res.json();
      setVendors((prev) => prev.map((v) => (v.id === draggedVendorId ? updatedContact : v)));
      if (selectedVendor?.id === draggedVendorId) {
        setSelectedVendor(updatedContact);
      }
      showToast(`Moved to ${PIPELINE_STATUS_LABELS[newStatus]}`);
    } catch (err) {
      console.error("Error updating vendor status:", err);
      showToast("Failed to update status. Please try again.");
    }
  }

  // Activity log
  async function handleAddActivity() {
    if (!selectedVendor || !newActivityDesc.trim()) return;
    const now = new Date().toISOString();
    const activity: Activity = {
      id: generateId(),
      type: newActivityType,
      description: newActivityDesc.trim(),
      date: now,
      createdBy: "User",
    };
    const changes = {
      activities: [...selectedVendor.activities, activity],
      updatedAt: now,
    };

    try {
      const res = await fetch(`/api/contacts/${selectedVendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error(`Failed to log activity: ${res.status}`);
      const updatedContact: Contact = await res.json();
      setVendors((prev) => prev.map((v) => (v.id === selectedVendor.id ? updatedContact : v)));
      setSelectedVendor(updatedContact);
      setNewActivityDesc("");
      setShowAddActivity(false);
      showToast("Activity logged.");
    } catch (err) {
      console.error("Error logging activity:", err);
      showToast("Failed to log activity. Please try again.");
    }
  }

  // Update notes on selected vendor
  async function handleUpdateNotes(notes: string) {
    if (!selectedVendor) return;
    const now = new Date().toISOString();
    const changes = { notes, updatedAt: now };

    // Optimistic update
    const optimistic = { ...selectedVendor, notes, updatedAt: now };
    setVendors((prev) => prev.map((v) => (v.id === selectedVendor.id ? optimistic : v)));
    setSelectedVendor(optimistic);

    try {
      const res = await fetch(`/api/contacts/${selectedVendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error(`Failed to update notes: ${res.status}`);
      const updatedContact: Contact = await res.json();
      setVendors((prev) => prev.map((v) => (v.id === selectedVendor.id ? updatedContact : v)));
      setSelectedVendor(updatedContact);
    } catch (err) {
      console.error("Error updating notes:", err);
      showToast("Failed to save notes. Please try again.");
    }
  }

  // Mass email
  function toggleEmailSelection(vendorId: string) {
    const next = new Set(selectedForEmail);
    if (next.has(vendorId)) next.delete(vendorId);
    else next.add(vendorId);
    setSelectedForEmail(next);
  }

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) {
      showToast("Please fill in the subject and body.");
      return;
    }
    const now = new Date().toISOString();

    const updatePromises = Array.from(selectedForEmail).map(async (vendorId) => {
      const vendor = vendors.find((v) => v.id === vendorId);
      if (!vendor) return null;
      const changes = {
        updatedAt: now,
        activities: [
          ...vendor.activities,
          {
            id: generateId(),
            type: "email" as ActivityType,
            description: `Email sent: "${emailSubject.trim()}"`,
            date: now,
            createdBy: "User",
          },
        ],
      };
      try {
        const res = await fetch(`/api/contacts/${vendorId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });
        if (!res.ok) return null;
        return await res.json() as Contact;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    const updatedMap = new Map<string, Contact>();
    results.forEach((c) => { if (c) updatedMap.set(c.id, c); });

    setVendors((prev) => prev.map((v) => updatedMap.get(v.id) ?? v));
    if (selectedVendor && updatedMap.has(selectedVendor.id)) {
      setSelectedVendor(updatedMap.get(selectedVendor.id)!);
    }

    showToast(`Email sent to ${selectedForEmail.size} recipient${selectedForEmail.size > 1 ? "s" : ""}.`);
    setShowEmailModal(false);
    setEmailSubject("");
    setEmailBody("");
    setSelectedForEmail(new Set());
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

  function getLastActivityDate(vendor: Contact): string {
    if (!vendor.activities.length) return "No activity";
    return formatDate(vendor.activities[vendor.activities.length - 1].date);
  }

  const activeFilterCount = [
    filterYear !== "all",
    filterCategory !== "all",
    filterStatus !== "all",
    filterAssignedTo !== "all",
  ].filter(Boolean).length;

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

      {/* Page Header — Wine gradient banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wine-950 via-wine-900 to-wine-800 p-6 mb-6 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Store className="w-5 h-5 text-gold-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
            </div>
            <p className="text-sm text-wine-200 ml-[52px]">
              Manage food, beverage, and entertainment vendors for Uncorked 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedForEmail.size > 0 && (
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Email ({selectedForEmail.size})
              </button>
            )}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-gold-500 text-wine-950 text-sm font-bold hover:bg-gold-400 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-wine-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading vendors...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-wine-900">{stats.total}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Total</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-orange-700">{stats.food}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Food</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-amber-700">{stats.beer}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Beer</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-wine-700">{stats.wine}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Wine</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-purple-700">{stats.entertainment}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Entertainment</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-blue-700">{stats.services}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Services</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center card-hover">
              <p className="text-xl font-bold text-emerald-600">{stats.byStatus.confirmed}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Confirmed</p>
            </div>
            <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl border border-gold-200 p-3 text-center card-hover">
              <p className="text-xl font-bold text-gold-800">{stats.prospects2026}</p>
              <p className="text-[11px] text-gold-700 uppercase tracking-wide font-semibold">2026 Prospects</p>
            </div>
          </div>

          {/* Year Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1 w-full sm:w-auto">Year:</span>
            <button
              onClick={() => setFilterYear("all")}
              className={cn(
                "px-3 py-2 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-full text-xs font-medium transition-all",
                filterYear === "all"
                  ? "bg-wine-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-wine-300 hover:text-wine-700"
              )}
            >
              All Years
            </button>
            {YEAR_OPTIONS.map((year) => (
              <button
                key={year}
                onClick={() => setFilterYear(filterYear === year ? "all" : year)}
                className={cn(
                  "px-3 py-2 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-full text-xs font-medium transition-all",
                  filterYear === year
                    ? year === 2026
                      ? "bg-gold-500 text-wine-950 shadow-sm font-bold"
                      : "bg-wine-900 text-white shadow-sm"
                    : year === 2026
                      ? "bg-gold-100 text-gold-800 border border-gold-300 hover:bg-gold-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-wine-300 hover:text-wine-700"
                )}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Search + Category & Status Filters + View Toggle */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search — full width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
              />
            </div>

            {/* Filter dropdowns row — stack on mobile, row on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-start sm:items-center gap-3">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as VendorCategory | "all")}
                className="w-full lg:w-auto px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
              >
                <option value="all">All Categories</option>
                {VENDOR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {VENDOR_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>

              {/* Pipeline Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PipelineStatus | "all")}
                className="w-full lg:w-auto px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
              >
                <option value="all">All Stages</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {PIPELINE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              {/* Assigned To Filter */}
              <select
                value={filterAssignedTo}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                className="w-full lg:w-auto px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
              >
                <option value="all">All Members</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilterYear("all");
                    setFilterCategory("all");
                    setFilterStatus("all");
                    setFilterAssignedTo("all");
                    setSearchQuery("");
                  }}
                  className="text-xs text-wine-600 hover:text-wine-800 underline underline-offset-2 min-h-[44px] sm:min-h-0 flex items-center"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {/* View Toggle — only show pipeline/table on sm+, always show grid */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5 self-start sm:self-end">
              {([
                { mode: "pipeline" as ViewMode, icon: Kanban, label: "Pipeline", hideOnMobile: true },
                { mode: "list" as ViewMode, icon: List, label: "Table", hideOnMobile: true },
                { mode: "grid" as ViewMode, icon: LayoutGrid, label: "Grid", hideOnMobile: false },
              ]).map(({ mode, icon: Icon, label, hideOnMobile }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={label}
                  className={cn(
                    "p-2.5 sm:p-2 rounded-md transition-all min-h-[44px] sm:min-h-0",
                    hideOnMobile && "hidden sm:block",
                    viewMode === mode
                      ? "bg-wine-100 text-wine-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </p>
            {filteredVendors.length > 0 && viewMode === "list" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedForEmail.size === filteredVendors.length) {
                      setSelectedForEmail(new Set());
                    } else {
                      setSelectedForEmail(new Set(filteredVendors.map((v) => v.id)));
                    }
                  }}
                  className="text-xs text-wine-600 hover:text-wine-800 underline underline-offset-2"
                >
                  {selectedForEmail.size === filteredVendors.length ? "Deselect all" : "Select all"}
                </button>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* Pipeline View */}
          {/* ============================================ */}
          {viewMode === "pipeline" && (
            <div className="hidden sm:flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map((stage) => {
                const colors = PIPELINE_COLORS[stage];
                const stageVendors = pipelineGroups[stage];
                return (
                  <div
                    key={stage}
                    className="flex-shrink-0 w-[280px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    {/* Column Header */}
                    <div className={cn("rounded-t-xl px-4 py-3 border-t-4", colors.header, colors.border.replace("border-", "border-t-"))}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
                          <span className={cn("text-sm font-semibold", colors.text)}>
                            {PIPELINE_STATUS_LABELS[stage]}
                          </span>
                        </div>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                          {stageVendors.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Body */}
                    <div className={cn("kanban-column rounded-b-xl border border-t-0 p-2 space-y-2", colors.border, "bg-white/50")}>
                      {stageVendors.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          No vendors
                        </div>
                      )}
                      {stageVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          draggable
                          onDragStart={() => handleDragStart(vendor.id)}
                          onClick={() => setSelectedVendor(vendor)}
                          className={cn(
                            "bg-white rounded-lg border border-gray-100 p-3 cursor-pointer card-hover group",
                            draggedVendorId === vendor.id && "opacity-50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{vendor.name}</p>
                              {vendor.company && vendor.company !== vendor.name && (
                                <p className="text-xs text-gray-500 truncate">{vendor.company}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {vendor.vendorCategory && (
                                  <CategoryBadge category={vendor.vendorCategory} />
                                )}
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {(vendor.years || []).map((y) => (
                                  <YearTag key={y} year={y} />
                                ))}
                              </div>
                              {vendor.assignedTo && vendor.assignedTo !== "Unassigned" && (
                                <p className="mt-1.5 text-[10px] text-gray-500 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 shrink-0" />
                                  {vendor.assignedTo}
                                </p>
                              )}
                              {vendor.address && (
                                <p className="mt-1.5 text-[10px] text-gray-400 truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {vendor.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================ */}
          {/* Table View */}
          {/* ============================================ */}
          {viewMode === "list" && (
            <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="w-10 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedForEmail.size === filteredVendors.length && filteredVendors.length > 0}
                          onChange={() => {
                            if (selectedForEmail.size === filteredVendors.length) {
                              setSelectedForEmail(new Set());
                            } else {
                              setSelectedForEmail(new Set(filteredVendors.map((v) => v.id)));
                            }
                          }}
                          className="rounded border-gray-300 text-wine-600 focus:ring-wine-500"
                        />
                      </th>
                      {[
                        { key: "name", label: "Vendor Name" },
                        { key: "category", label: "Category" },
                        { key: "status", label: "Status" },
                        { key: "assignedTo", label: "Assigned To" },
                        { key: "years", label: "Years" },
                        { key: "location", label: "Location" },
                        { key: "contact", label: "Contact Info" },
                        { key: "lastActivity", label: "Last Activity" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-wine-700 select-none"
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {sortField === key && (
                              <span className="text-wine-600">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedVendors.map((vendor) => (
                      <tr
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className="hover:bg-wine-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedForEmail.has(vendor.id)}
                            onChange={() => toggleEmailSelection(vendor.id)}
                            className="rounded border-gray-300 text-wine-600 focus:ring-wine-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{vendor.name}</p>
                            {vendor.company && vendor.company !== vendor.name && (
                              <p className="text-xs text-gray-500">{vendor.company}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {vendor.vendorCategory && (
                            <CategoryBadge category={vendor.vendorCategory} />
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={vendor.status} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            {vendor.assignedTo && vendor.assignedTo !== "Unassigned" ? (
                              <><User className="w-3 h-3 shrink-0 text-gray-400" />{vendor.assignedTo}</>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(vendor.years || []).map((y) => (
                              <YearTag key={y} year={y} />
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {vendor.address || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-0.5">
                            {vendor.email && (
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 shrink-0" />
                                {vendor.email}
                              </p>
                            )}
                            {vendor.phone && (
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <Phone className="w-3 h-3 shrink-0" />
                                {vendor.phone}
                              </p>
                            )}
                            {!vendor.email && !vendor.phone && (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {getLastActivityDate(vendor)}
                        </td>
                      </tr>
                    ))}
                    {sortedVendors.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-12 text-center text-gray-400 text-sm">
                          No vendors match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* Card Grid View — Grouped by Category */}
          {/* ============================================ */}
          {viewMode === "grid" && (
            <div className="space-y-8">
              {Object.entries(categoryGroups).length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No vendors match your filters.
                </div>
              )}
              {VENDOR_CATEGORIES.map((cat) => {
                const group = categoryGroups[cat];
                if (!group || group.length === 0) return null;
                const CatIcon = VENDOR_CATEGORY_ICONS[cat];
                return (
                  <div key={cat}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", VENDOR_CATEGORY_COLORS[cat])}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">{VENDOR_CATEGORY_LABELS[cat]}</h2>
                      <span className="text-sm text-gray-500 font-medium">({group.length})</span>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.map((vendor) => (
                        <div
                          key={vendor.id}
                          onClick={() => setSelectedVendor(vendor)}
                          className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer card-hover"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{vendor.name}</p>
                              {vendor.company && vendor.company !== vendor.name && (
                                <p className="text-xs text-gray-500 truncate">{vendor.company}</p>
                              )}
                            </div>
                            {vendor.vendorCategory && (
                              <CategoryBadge category={vendor.vendorCategory} />
                            )}
                          </div>

                          <div className="mb-2">
                            <StatusBadge status={vendor.status} />
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {(vendor.years || []).map((y) => (
                              <YearTag key={y} year={y} />
                            ))}
                          </div>

                          {vendor.assignedTo && vendor.assignedTo !== "Unassigned" && (
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mb-1">
                              <User className="w-3 h-3 shrink-0" />
                              {vendor.assignedTo}
                            </p>
                          )}

                          {vendor.address && (
                            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mb-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {vendor.address}
                            </p>
                          )}

                          {(vendor.email || vendor.phone) && (
                            <div className="flex flex-col gap-0.5 mt-2 pt-2 border-t border-gray-50">
                              {vendor.email && (
                                <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  {vendor.email}
                                </p>
                              )}
                              {vendor.phone && (
                                <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  {vendor.phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* Contact Detail Slide-over */}
      {/* ============================================ */}
      {selectedVendor && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 modal-overlay"
            onClick={() => setSelectedVendor(null)}
          />
          {/* Panel */}
          <div
            ref={slideoverRef}
            className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 z-50 w-full sm:max-w-lg bg-white shadow-2xl overflow-y-auto"
            style={{ animation: "slideInRight 0.3s ease-out forwards" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-wine-950 to-wine-900 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{selectedVendor.name}</h2>
                  {selectedVendor.company && selectedVendor.company !== selectedVendor.name && (
                    <p className="text-sm text-wine-200 truncate">{selectedVendor.company}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {selectedVendor.vendorCategory && (
                      <CategoryBadge category={selectedVendor.vendorCategory} size="md" />
                    )}
                    <StatusBadge status={selectedVendor.status} />
                  </div>
                  {selectedVendor.assignedTo && selectedVendor.assignedTo !== "Unassigned" && (
                    <p className="text-xs text-wine-200 mt-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-wine-300" />
                      Assigned to {selectedVendor.assignedTo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedVendor.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`mailto:${selectedVendor.email}`} className="text-wine-600 hover:underline truncate">
                        {selectedVendor.email}
                      </a>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`tel:${selectedVendor.phone}`} className="text-wine-600 hover:underline">
                        {selectedVendor.phone}
                      </a>
                    </div>
                  )}
                  {selectedVendor.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                      <a
                        href={selectedVendor.website.startsWith("http") ? selectedVendor.website : `https://${selectedVendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wine-600 hover:underline truncate"
                      >
                        {selectedVendor.website}
                      </a>
                    </div>
                  )}
                  {selectedVendor.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700">{selectedVendor.address}</span>
                    </div>
                  )}
                  {!selectedVendor.email && !selectedVendor.phone && !selectedVendor.website && !selectedVendor.address && (
                    <p className="text-sm text-gray-400 italic">No contact information on file.</p>
                  )}
                </div>
              </div>

              {/* Year History */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Year History</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedVendor.years || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No year history.</p>
                  )}
                  {(selectedVendor.years || [])
                    .sort((a, b) => a - b)
                    .map((y) => (
                      <span
                        key={y}
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          y === 2026
                            ? "bg-gold-100 text-gold-800 border border-gold-300"
                            : "bg-wine-100 text-wine-700"
                        )}
                      >
                        {y}
                      </span>
                    ))}
                </div>
              </div>

              {/* Tags */}
              {selectedVendor.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVendor.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h3>
                <textarea
                  value={selectedVendor.notes}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this vendor..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300 resize-none"
                />
              </div>

              {/* Activity Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity Timeline</h3>
                  <button
                    onClick={() => setShowAddActivity(!showAddActivity)}
                    className="text-xs text-wine-600 hover:text-wine-800 font-medium min-h-[44px] px-2 flex items-center"
                  >
                    {showAddActivity ? "Cancel" : "+ Add Activity"}
                  </button>
                </div>

                {/* Add Activity Form */}
                {showAddActivity && (
                  <div className="mb-4 p-3 rounded-lg border border-wine-200 bg-wine-50/50">
                    <div className="flex gap-2 mb-2">
                      <select
                        value={newActivityType}
                        onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                        className="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-wine-300"
                      >
                        {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={newActivityDesc}
                      onChange={(e) => setNewActivityDesc(e.target.value)}
                      rows={2}
                      placeholder="Describe the activity..."
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 resize-none mb-2"
                    />
                    <button
                      onClick={handleAddActivity}
                      disabled={!newActivityDesc.trim()}
                      className="px-4 py-2.5 min-h-[44px] rounded-md bg-wine-600 text-white text-xs font-medium hover:bg-wine-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Log Activity
                    </button>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  {selectedVendor.activities.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No activity logged yet.</p>
                  )}
                  {[...selectedVendor.activities]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((activity) => {
                      const ActivityIcon = ACTIVITY_ICONS[activity.type];
                      const activityColor = ACTIVITY_COLORS[activity.type];
                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", activityColor)}>
                            <ActivityIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-400">{formatDateTime(activity.date)}</p>
                              {activity.createdBy && (
                                <span className="text-xs text-gray-400">by {activity.createdBy}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedVendor(null);
                    openEditModal(selectedVendor);
                  }}
                  className="flex-1 px-4 py-3 sm:py-2 min-h-[44px] rounded-lg bg-wine-600 text-white text-sm font-medium hover:bg-wine-700 transition-colors"
                >
                  Edit Vendor
                </button>
                <button
                  onClick={() => handleDeleteVendor(selectedVendor.id)}
                  className="px-4 py-3 sm:py-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* Create/Edit Modal */}
      {/* ============================================ */}
      {showVendorModal && (
        <>
          <div className="fixed inset-0 z-50 modal-overlay" onClick={() => setShowVendorModal(false)} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <div
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
                <h2 className="text-lg font-bold text-wine-950">
                  {editingVendor ? "Edit Vendor" : "Add Vendor"}
                </h2>
                <button onClick={() => setShowVendorModal(false)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vendor name"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Email + Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray/600 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, CA"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Type + Status row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "vendor" | "potential_vendor" })}
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
                    >
                      <option value="vendor">Vendor</option>
                      <option value="potential_vendor">Potential Vendor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pipeline Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PipelineStatus })}
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>{PIPELINE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category + Assigned To row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Vendor Category</label>
                    <select
                      value={formData.vendorCategory}
                      onChange={(e) => setFormData({ ...formData, vendorCategory: e.target.value as VendorCategory | "" })}
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
                    >
                      <option value="">Select category...</option>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{VENDOR_CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300"
                    >
                      {TEAM_MEMBERS.map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Years */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Years (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: e.target.value })}
                    placeholder="2022, 2023, 2024, 2026"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="craft-brewery, local, beer-garden"
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300 resize-none"
                  />
                </div>

                {/* Public Visibility */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="publicVisible"
                    checked={formData.publicVisible}
                    onChange={(e) => setFormData({ ...formData, publicVisible: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-wine-600 focus:ring-wine-500 cursor-pointer"
                  />
                  <label htmlFor="publicVisible" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Show on public website</span>
                    <span className="text-xs text-gray-500">This vendor will appear on the public-facing event page</span>
                  </label>
                </div>

                {/* Save button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveVendor}
                    className="flex-1 px-4 py-3 sm:py-2.5 min-h-[44px] rounded-lg bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-semibold hover:from-wine-700 hover:to-wine-800 transition-all shadow-sm"
                  >
                    {editingVendor ? "Save Changes" : "Add Vendor"}
                  </button>
                  <button
                    onClick={() => setShowVendorModal(false)}
                    className="px-4 py-3 sm:py-2.5 min-h-[44px] rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* Mass Email Modal */}
      {/* ============================================ */}
      {showEmailModal && (
        <>
          <div className="fixed inset-0 z-50 modal-overlay" onClick={() => setShowEmailModal(false)} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <div
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-wine-950">Compose Email</h2>
                  <p className="text-xs text-gray-500">{selectedForEmail.size} recipient{selectedForEmail.size > 1 ? "s" : ""} selected</p>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Recipients preview */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
                  <div className="flex flex-wrap gap-1 p-2 rounded-lg border border-gray-200 bg-gray-50 max-h-20 overflow-y-auto">
                    {vendors
                      .filter((v) => selectedForEmail.has(v.id))
                      .map((v) => (
                        <span key={v.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wine-100 text-wine-700 text-xs">
                          {v.name}
                          {v.email && <span className="text-wine-400">({v.email})</span>}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    placeholder="Type your email message..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-300 focus:border-wine-300 resize-none"
                  />
                </div>

                {/* Send */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={!emailSubject.trim() || !emailBody.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Email
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
