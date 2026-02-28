"use client";

import {
  Shield,
  Users,
  Globe,
  Lock,
  Eye,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role =
  | "super_admin"
  | "club_admin"
  | "board_member"
  | "website_admin"
  | "uncorked_committee"
  | "committee_chair"
  | "member"
  | "guest";

const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-red-50 text-red-700 border-red-200",
  club_admin: "bg-amber-50 text-amber-700 border-amber-200",
  board_member: "bg-purple-50 text-purple-700 border-purple-200",
  website_admin: "bg-blue-50 text-blue-700 border-blue-200",
  uncorked_committee: "bg-rose-50 text-rose-700 border-rose-200",
  committee_chair: "bg-indigo-50 text-indigo-700 border-indigo-200",
  member: "bg-gray-50 text-gray-600 border-gray-200",
  guest: "bg-gray-50 text-gray-400 border-gray-100",
};

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

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium",
        ROLE_COLORS[role]
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

// ── Role Hierarchy Data ────────────────────────────────────────────────────

const roleHierarchy: {
  role: Role;
  level: number;
  who: string;
  access: string;
}[] = [
  {
    role: "super_admin",
    level: 0,
    who: "Dustin, 1-2 club officers",
    access:
      "Everything, manages all permissions, Bryn full control",
  },
  {
    role: "club_admin",
    level: 1,
    who: "President, Secretary",
    access:
      "Member mgmt, reports, announcements, event approval",
  },
  {
    role: "board_member",
    level: 2,
    who: "Board of Directors",
    access: "View reports, manage own committees",
  },
  {
    role: "website_admin",
    level: 3,
    who: "Designated tech person(s)",
    access: "Edit public website pages via CMS/Bryn",
  },
  {
    role: "uncorked_committee",
    level: 4,
    who: "Uncorked planning team (~20 people)",
    access: "Full access to Uncorked Hub",
  },
  {
    role: "committee_chair",
    level: 5,
    who: "Committee chairs",
    access: "Manage their committee, submit events",
  },
  {
    role: "member",
    level: 6,
    who: "All active Rotary members",
    access:
      "Portal: directory, profile, attendance, events, Bryn basic",
  },
  {
    role: "guest",
    level: 7,
    who: "Prospective members",
    access: "Limited portal view",
  },
];

// ── Permission Matrix Data ─────────────────────────────────────────────────

type PermissionKey =
  | "public_website"
  | "member_directory"
  | "own_profile"
  | "attendance_own"
  | "attendance_all"
  | "committees"
  | "events_submit"
  | "events_approve"
  | "announcements"
  | "reports"
  | "manage_members"
  | "manage_roles"
  | "uncorked_hub"
  | "bryn_website_edit"
  | "bryn_reports"
  | "bryn_basic_qa"
  | "admin_panel"
  | "settings";

const permissionLabels: Record<PermissionKey, string> = {
  public_website: "Public website",
  member_directory: "Member directory",
  own_profile: "Own profile",
  attendance_own: "Attendance (own)",
  attendance_all: "Attendance (all)",
  committees: "Committees",
  events_submit: "Events (submit)",
  events_approve: "Events (approve)",
  announcements: "Announcements",
  reports: "Reports",
  manage_members: "Manage members",
  manage_roles: "Manage roles",
  uncorked_hub: "Uncorked Hub",
  bryn_website_edit: "Bryn (website edit)",
  bryn_reports: "Bryn (reports)",
  bryn_basic_qa: "Bryn (basic Q&A)",
  admin_panel: "Admin panel",
  settings: "Settings",
};

const allRoles: Role[] = [
  "super_admin",
  "club_admin",
  "board_member",
  "website_admin",
  "uncorked_committee",
  "committee_chair",
  "member",
  "guest",
];

// true = has permission, false = does not
const permissionMatrix: Record<PermissionKey, Record<Role, boolean>> = {
  public_website: {
    super_admin: true, club_admin: true, board_member: true, website_admin: true,
    uncorked_committee: true, committee_chair: true, member: true, guest: true,
  },
  member_directory: {
    super_admin: true, club_admin: true, board_member: true, website_admin: true,
    uncorked_committee: true, committee_chair: true, member: true, guest: false,
  },
  own_profile: {
    super_admin: true, club_admin: true, board_member: true, website_admin: true,
    uncorked_committee: true, committee_chair: true, member: true, guest: true,
  },
  attendance_own: {
    super_admin: true, club_admin: true, board_member: true, website_admin: true,
    uncorked_committee: true, committee_chair: true, member: true, guest: false,
  },
  attendance_all: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  committees: {
    super_admin: true, club_admin: true, board_member: true, website_admin: false,
    uncorked_committee: false, committee_chair: true, member: true, guest: false,
  },
  events_submit: {
    super_admin: true, club_admin: true, board_member: true, website_admin: false,
    uncorked_committee: false, committee_chair: true, member: false, guest: false,
  },
  events_approve: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  announcements: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  reports: {
    super_admin: true, club_admin: true, board_member: true, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  manage_members: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  manage_roles: {
    super_admin: true, club_admin: false, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  uncorked_hub: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: true, committee_chair: false, member: false, guest: false,
  },
  bryn_website_edit: {
    super_admin: true, club_admin: true, board_member: false, website_admin: true,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  bryn_reports: {
    super_admin: true, club_admin: true, board_member: true, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  bryn_basic_qa: {
    super_admin: true, club_admin: true, board_member: true, website_admin: true,
    uncorked_committee: true, committee_chair: true, member: true, guest: false,
  },
  admin_panel: {
    super_admin: true, club_admin: true, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
  settings: {
    super_admin: true, club_admin: false, board_member: false, website_admin: false,
    uncorked_committee: false, committee_chair: false, member: false, guest: false,
  },
};

// ── Route Access Data ──────────────────────────────────────────────────────

const routeAccess: {
  route: string;
  description: string;
  roles: string;
}[] = [
  {
    route: "(rotary)/*",
    description: "Public website",
    roles: "Public, everyone",
  },
  {
    route: "portal/*",
    description: "Member portal",
    roles: "All authenticated (member+)",
  },
  {
    route: "admin/*",
    description: "Admin panel",
    roles: "super_admin, club_admin (board_member, website_admin partial)",
  },
  {
    route: "uncorked-hub/*",
    description: "Uncorked planning",
    roles: "super_admin, club_admin, uncorked_committee",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function RolesPermissionsTab() {
  return (
    <div className="space-y-8">
      {/* Role Hierarchy */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Role Hierarchy
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Level
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Who
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Access Summary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roleHierarchy.map((row, i) => (
                  <tr
                    key={row.role}
                    className={cn(
                      i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-4 py-3">
                      <RoleBadge role={row.role} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {row.level}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.who}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.access}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Permission Matrix */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Permission Matrix
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                    Feature
                  </th>
                  {allRoles.map((role) => (
                    <th
                      key={role}
                      className="px-3 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide min-w-[80px]"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(Object.keys(permissionLabels) as PermissionKey[]).map(
                  (perm, i) => (
                    <tr
                      key={perm}
                      className={cn(
                        i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                      )}
                    >
                      <td className="px-4 py-2.5 text-sm text-gray-700 font-medium sticky left-0 z-10 bg-inherit">
                        {permissionLabels[perm]}
                      </td>
                      {allRoles.map((role) => (
                        <td
                          key={role}
                          className="px-3 py-2.5 text-center"
                        >
                          {permissionMatrix[perm][role] ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block w-5 h-5 leading-5 text-gray-300 text-center">
                              —
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Route Access */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Route Access
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Route Group
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Accessible By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routeAccess.map((row, i) => (
                  <tr
                    key={row.route}
                    className={cn(
                      i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                        {row.route}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.roles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How Roles Stack */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            How Roles Stack
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Storage
              </p>
              <p className="text-sm text-gray-600">
                Roles are stored in Clerk{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  publicMetadata.roles
                </code>{" "}
                as a JSON array (e.g.{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  {`["club_admin", "member"]`}
                </code>
                ).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Additive Permissions
              </p>
              <p className="text-sm text-gray-600">
                Permissions are additive — the effective permission set is the
                union of all assigned roles. A user with both{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  board_member
                </code>{" "}
                and{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  website_admin
                </code>{" "}
                gets the combined permissions of both.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Enforcement
              </p>
              <p className="text-sm text-gray-600">
                Checked at runtime via{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  requireRole()
                </code>{" "}
                and{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  requireAnyRole()
                </code>{" "}
                helpers defined in{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  src/lib/auth.ts
                </code>
                . Server layouts use these guards to protect routes before rendering.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
