"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Avatar from "@radix-ui/react-avatar";
import { Search, X, Users, Phone, Mail, Building2, MapPin, Filter, ChevronDown, ChevronUp } from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  classification: string;
  bio: string;
  address: string;
  photoUrl: string | null;
  memberType: string;
  memberSince: string | null;
  status: string;
  roles: string; // JSON array string e.g. '["member"]' or '["board_member","member"]'
};

type CommitteeMembership = {
  userId: string;
  committeeName: string;
};

function parseRoles(roles: string): string[] {
  try {
    return JSON.parse(roles) as string[];
  } catch {
    return ["member"];
  }
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [committeeMemberships, setCommitteeMemberships] = useState<CommitteeMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("all");
  const [filterClassification, setFilterClassification] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [selected, setSelected] = useState<Member | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/members/committees").then((r) => r.json()).catch(() => []),
    ])
      .then(([membersData, committeesData]) => {
        setMembers(membersData);
        setCommitteeMemberships(committeesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive filter options from data
  const committees = useMemo(() => {
    const names = [...new Set(committeeMemberships.map((c) => c.committeeName))].sort();
    return names;
  }, [committeeMemberships]);

  const classifications = useMemo(() => {
    const vals = [...new Set(members.map((m) => m.classification).filter(Boolean))].sort();
    return vals;
  }, [members]);

  // Build userId -> committee names map
  const userCommittees = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cm of committeeMemberships) {
      const existing = map.get(cm.userId) ?? [];
      existing.push(cm.committeeName);
      map.set(cm.userId, existing);
    }
    return map;
  }, [committeeMemberships]);

  const filtered = useMemo(() => {
    let result = members;

    if (filterRole !== "all") {
      result = result.filter((m) => {
        const roles = parseRoles(m.roles);
        if (filterRole === "board") return roles.includes("board_member");
        if (filterRole === "member") return !roles.includes("board_member");
        return true;
      });
    }

    if (filterClassification !== "all") {
      result = result.filter((m) => m.classification === filterClassification);
    }

    if (filterCommittee !== "all") {
      result = result.filter((m) => {
        const memberCommittees = userCommittees.get(m.id) ?? [];
        return memberCommittees.includes(filterCommittee);
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.classification?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [members, search, filterRole, filterClassification, filterCommittee, userCommittees]);

  const activeFilterCount = [
    filterRole !== "all",
    filterClassification !== "all",
    filterCommittee !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterRole("all");
    setFilterClassification("all");
    setFilterCommittee("all");
    setSearchInput("");
    setSearch("");
  };

  const initials = (m: Member) =>
    `${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Directory</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading members…" : `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Search bar — full width on mobile */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, company, or classification…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {searchInput && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters — collapsible on mobile */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toggle button (mobile) / header (desktop) */}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 sm:hidden"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          {filtersOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Filter controls */}
        <div className={`px-4 py-3 flex flex-wrap gap-3 items-center ${filtersOpen ? "flex" : "hidden sm:flex"}`}>
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="board">Board</option>
            <option value="member">Member</option>
          </select>

          {classifications.length > 0 && (
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classifications</option>
              {classifications.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {committees.length > 0 && (
            <select
              value={filterCommittee}
              onChange={(e) => setFilterCommittee(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Committees</option>
              {committees.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No members found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => {
            const roles = parseRoles(member.roles);
            const isBoard = roles.includes("board_member");
            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar.Root className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Avatar.Image
                      src={member.photoUrl ?? undefined}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-full h-full object-cover"
                    />
                    <Avatar.Fallback className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {initials(member)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {member.firstName} {member.lastName}
                    </p>
                    {isBoard && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Board
                      </span>
                    )}
                  </div>
                </div>
                {member.classification && (
                  <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                    {member.classification}
                  </p>
                )}
                {member.company && (
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    {member.company}
                  </p>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\D/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {member.phone}
                  </a>
                )}
                {member.email && (
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {member.email}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Member Detail Modal */}
      <Dialog.Root open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
            {selected && (
              <>
                {/* Modal header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar.Root className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <Avatar.Image
                          src={selected.photoUrl ?? undefined}
                          alt={`${selected.firstName} ${selected.lastName}`}
                          className="w-full h-full object-cover"
                        />
                        <Avatar.Fallback className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                          {initials(selected)}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <div>
                        <Dialog.Title className="text-xl font-bold">
                          {selected.firstName} {selected.lastName}
                        </Dialog.Title>
                        {selected.classification && (
                          <p className="text-blue-200 text-sm mt-0.5">{selected.classification}</p>
                        )}
                        {parseRoles(selected.roles).includes("board_member") && (
                          <span className="mt-1 inline-block text-xs bg-amber-400/30 text-amber-100 px-2 py-0.5 rounded-full">
                            Board Member
                          </span>
                        )}
                        {(() => {
                          const memberCommittees = userCommittees.get(selected.id) ?? [];
                          return memberCommittees.length > 0 ? (
                            <p className="text-blue-200 text-xs mt-1">
                              {memberCommittees.join(", ")}
                            </p>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <Dialog.Close className="rounded-lg p-1.5 hover:bg-blue-700 transition-colors">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>
                </div>

                {/* Modal body */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {selected.company && (
                    <InfoRow icon={Building2} label="Company" value={selected.company} />
                  )}
                  {selected.phone && (
                    <InfoRowLink
                      icon={Phone}
                      label="Phone"
                      value={selected.phone}
                      href={`tel:${selected.phone.replace(/\D/g, "")}`}
                    />
                  )}
                  {selected.email && (
                    <InfoRowLink
                      icon={Mail}
                      label="Email"
                      value={selected.email}
                      href={`mailto:${selected.email}`}
                    />
                  )}
                  {selected.address && (
                    <InfoRow icon={MapPin} label="Address" value={selected.address} />
                  )}
                  {selected.memberSince && (
                    <InfoRow
                      icon={Users}
                      label="Member Since"
                      value={new Date(selected.memberSince).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                  {selected.bio && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        About
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selected.bio}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function InfoRowLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <a href={href} className="text-sm text-blue-600 hover:underline break-all">
          {value}
        </a>
      </div>
    </div>
  );
}
