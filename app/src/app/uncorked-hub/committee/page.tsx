"use client";

import { useEffect, useState, useMemo } from "react";
import {
  UsersRound,
  Mail,
  Phone,
  Building2,
  Star,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
// TODO: FUTURE — Replace COMMITTEE_MEMBERS hardcoded data with a query from the users table
// (where users have the uncorked_committee role). This lets admins manage committee membership
// through the admin panel without editing code. Track progress in BUILD-COORD.md.
import { COMMITTEE_MEMBERS, CommitteeMember } from "@/lib/types";
import { cn } from "@/lib/utils";

// ============================================
// Constants
// ============================================

const LEADERSHIP_IDS = ["jordan", "dan", "leslie", "dustin"];

const ROLE_LEGEND: { role: string; areas: string[]; color: string }[] = [
  { role: "Event Chair", areas: ["Overall event leadership", "Vendor & sponsor coordination", "Ticketing"], color: "bg-wine-600" },
  { role: "Co-Chair / Operations", areas: ["Operations", "Platform admin", "Website", "Sponsor outreach"], color: "bg-wine-500" },
  { role: "Club President", areas: ["Meeting facilitation", "Vendor relationships", "Budget"], color: "bg-wine-400" },
  { role: "Operations / Tech", areas: ["Website & CMS", "Tech infrastructure", "Credit card processing"], color: "bg-blue-500" },
  { role: "Vendor Coordinator", areas: ["Vendor agreements", "Vendor outreach", "Vendor packages"], color: "bg-amber-500" },
  { role: "Treasurer / Finance", areas: ["Financial reporting", "Budget tracking", "Payments"], color: "bg-emerald-500" },
  { role: "Marketing / Social Media", areas: ["Social media", "Marketing campaigns", "Communications"], color: "bg-purple-500" },
  { role: "Responsible Beverage Service", areas: ["Beverage certification", "Alcohol compliance"], color: "bg-orange-500" },
];

// ============================================
// Helpers
// ============================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAssignedCount(
  name: string,
  sponsors: { assignedTo: string }[],
  vendors: { assignedTo: string }[]
): { sponsors: number; vendors: number; total: number } {
  const s = sponsors.filter((c) => c.assignedTo === name).length;
  const v = vendors.filter((c) => c.assignedTo === name).length;
  return { sponsors: s, vendors: v, total: s + v };
}

// ============================================
// Main Page
// ============================================

export default function CommitteePage() {
  const [sponsors, setSponsors] = useState<{ assignedTo: string }[]>([]);
  const [vendors, setVendors] = useState<{ assignedTo: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts?type=sponsor,potential_sponsor").then((r) => r.json()),
      fetch("/api/contacts?type=vendor,potential_vendor").then((r) => r.json()),
    ])
      .then(([s, v]) => {
        if (Array.isArray(s)) setSponsors(s);
        if (Array.isArray(v)) setVendors(v);
      })
      .catch(() => {});
  }, []);

  const leadership = useMemo(
    () => COMMITTEE_MEMBERS.filter((m) => LEADERSHIP_IDS.includes(m.id)),
    []
  );

  const otherMembers = useMemo(
    () => COMMITTEE_MEMBERS.filter((m) => !LEADERSHIP_IDS.includes(m.id)),
    []
  );

  const stats = useMemo(() => {
    const all = COMMITTEE_MEMBERS;
    return {
      total: all.length,
      withEmail: all.filter((m) => m.email).length,
      withPhone: all.filter((m) => m.phone).length,
      totalResponsibilities: all.reduce((sum, m) => sum + m.responsibilities.length, 0),
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 p-6 sm:p-8 lg:p-10 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <UsersRound className="w-5 h-5 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold">
              Team Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
            Uncorked Committee
          </h1>
          <p className="text-wine-200 text-sm max-w-xl">
            Meet the team behind Fullerton Uncorked 2026
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-gold-400/10 to-transparent" />
        <div className="absolute -right-5 -bottom-14 w-64 h-64 rounded-full bg-gradient-to-br from-wine-600/20 to-transparent" />
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<UsersRound className="w-4 h-4 text-wine-600" />}
          value={stats.total}
          label="Committee Members"
        />
        <StatCard
          icon={<Mail className="w-4 h-4 text-blue-600" />}
          value={stats.withEmail}
          label="With Email"
        />
        <StatCard
          icon={<Phone className="w-4 h-4 text-emerald-600" />}
          value={stats.withPhone}
          label="With Phone"
        />
        <StatCard
          icon={<ClipboardList className="w-4 h-4 text-purple-600" />}
          value={stats.totalResponsibilities}
          label="Responsibilities"
        />
      </div>

      {/* ── Leadership Section ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-semibold text-wine-900">Leadership</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leadership.map((member) => (
            <LeadershipCard
              key={member.id}
              member={member}
              assigned={getAssignedCount(member.name, sponsors, vendors)}
            />
          ))}
        </div>
      </section>

      {/* ── Full Committee Grid ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UsersRound className="w-5 h-5 text-wine-600" />
          <h2 className="text-lg font-semibold text-wine-900">Full Committee</h2>
          <span className="text-xs text-gray-400 ml-1">
            ({otherMembers.length} members)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {otherMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              assigned={getAssignedCount(member.name, sponsors, vendors)}
            />
          ))}
        </div>
      </section>

      {/* ── Role Legend ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-wine-600" />
          <h2 className="text-lg font-semibold text-wine-900">Role Coverage</h2>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLE_LEGEND.map((entry) => (
              <div key={entry.role} className="flex gap-3">
                <div className={cn("w-1 rounded-full shrink-0", entry.color)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {entry.role}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {entry.areas.map((area) => (
                      <li
                        key={area}
                        className="text-xs text-gray-500 flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                        <span className="truncate">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// Components
// ============================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 card-hover">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function LeadershipCard({
  member,
  assigned,
}: {
  member: CommitteeMember;
  assigned: { sponsors: number; vendors: number; total: number };
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5 sm:p-6 card-hover">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/20">
          <span className="text-lg sm:text-xl font-bold text-white">
            {getInitials(member.name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-wine-600 truncate">{member.role}</p>
          {member.affiliation && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{member.affiliation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Links */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-wine-50 hover:bg-wine-100 text-wine-700 text-xs font-medium transition-colors min-h-[44px]"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{member.email}</span>
        </a>
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{member.phone}</span>
          </a>
        )}
      </div>

      {/* Responsibilities */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {member.responsibilities.map((r) => (
          <span
            key={r}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold-50 text-gold-800 text-[11px] font-medium border border-gold-200/60"
          >
            {r}
          </span>
        ))}
      </div>

      {/* Assigned Contacts */}
      {assigned.total > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-gold-500" />
            {assigned.sponsors} sponsor{assigned.sponsors !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-wine-400" />
            {assigned.vendors} vendor{assigned.vendors !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function MemberCard({
  member,
  assigned,
}: {
  member: CommitteeMember;
  assigned: { sponsors: number; vendors: number; total: number };
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 sm:p-5 card-hover">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-wine-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-wine-700">
            {getInitials(member.name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {member.name}
          </h3>
          <p className="text-xs font-medium text-wine-600 truncate">{member.role}</p>
          {member.affiliation && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{member.affiliation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-3 space-y-1.5">
        <a
          href={`mailto:${member.email}`}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-wine-600 transition-colors min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-wine-50"
        >
          <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{member.email}</span>
        </a>
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-wine-600 transition-colors min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-wine-50"
          >
            <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>{member.phone}</span>
          </a>
        )}
      </div>

      {/* Responsibilities */}
      <div className="mt-3 flex flex-wrap gap-1">
        {member.responsibilities.map((r) => (
          <span
            key={r}
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100"
          >
            {r}
          </span>
        ))}
      </div>

      {/* Assigned Contacts */}
      {assigned.total > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-3 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Star className="w-3 h-3 text-gold-500" />
            {assigned.sponsors} sponsor{assigned.sponsors !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3 h-3 text-wine-400" />
            {assigned.vendors} vendor{assigned.vendors !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
