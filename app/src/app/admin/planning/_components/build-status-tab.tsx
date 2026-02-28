"use client";

import {
  CheckCircle2,
  Server,
  Database,
  Globe,
  Users,
  Shield,
  BarChart3,
  Wine,
  Bot,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Terminal Data ──────────────────────────────────────────────────────────

const terminals: {
  id: string;
  name: string;
  description: string;
  deliverables: string[];
}[] = [
  {
    id: "T1",
    name: "Auth & Infrastructure",
    description:
      "Foundation layer — authentication, database schema, middleware, and layout system.",
    deliverables: [
      "Clerk authentication with 8 roles",
      "13 database tables (Neon Postgres + Drizzle)",
      "Route middleware for protection",
      "3 layout groups (public, portal, admin)",
    ],
  },
  {
    id: "T2",
    name: "Member Portal",
    description:
      "Authenticated member experience — dashboard, directory, profile, and more.",
    deliverables: [
      "7 portal pages",
      "11 API routes",
      "Member directory with search",
      "Profile editing, attendance tracking",
    ],
  },
  {
    id: "T3",
    name: "Public Website + CMS",
    description:
      "Public-facing Rotary website with content management.",
    deliverables: [
      "8 public pages",
      "Rotary header & footer components",
      "CMS page editor",
      "Database seed script (7 pages)",
    ],
  },
  {
    id: "T4A+B",
    name: "Bryn AI Assistant",
    description:
      "AI assistant backend and chat interface for club operations.",
    deliverables: [
      "System prompt with 4 contexts",
      "17 role-filtered tools",
      "Streaming chat API",
      "Chat UI with message components",
    ],
  },
  {
    id: "T5",
    name: "Uncorked + Admin",
    description:
      "Admin panel and Uncorked fundraiser planning hub.",
    deliverables: [
      "8 admin pages",
      "12 admin API routes",
      "Uncorked Hub (9 pages)",
      "Budget, sponsors, vendors management",
    ],
  },
];

// ── Module Checklist ───────────────────────────────────────────────────────

const modules: { label: string; detail: string; icon: React.ElementType }[] = [
  {
    label: "Authentication & RBAC",
    detail: "8 roles, Clerk middleware",
    icon: Shield,
  },
  {
    label: "Database",
    detail: "21 tables, Neon Postgres, Drizzle ORM",
    icon: Database,
  },
  {
    label: "Public Website",
    detail: "8 CMS pages, rotary header/footer",
    icon: Globe,
  },
  {
    label: "Member Portal",
    detail:
      "Dashboard, directory, profile, attendance, committees, events, announcements",
    icon: Users,
  },
  {
    label: "Admin Panel",
    detail:
      "Members, attendance, committees, events, announcements, website, reports, settings",
    icon: BarChart3,
  },
  {
    label: "Uncorked Hub",
    detail:
      "Dashboard, meetings, tasks, budget, sponsors, vendors, committee, vendor apps",
    icon: Wine,
  },
  {
    label: "Bryn AI",
    detail: "4 contexts, 17 tools, streaming chat, thread persistence",
    icon: Bot,
  },
];

// ── Route Groups ───────────────────────────────────────────────────────────

const routeGroups: {
  group: string;
  pages: number;
  theme: string;
  color: string;
}[] = [
  { group: "(rotary)/", pages: 8, theme: "Navy / Gold", color: "bg-blue-900" },
  {
    group: "(public)/",
    pages: 3,
    theme: "Sponsors, Vendors, Vendor Interest",
    color: "bg-gray-600",
  },
  { group: "portal/", pages: 8, theme: "Slate / Blue", color: "bg-slate-600" },
  { group: "admin/", pages: 9, theme: "Gray / Amber", color: "bg-amber-600" },
  {
    group: "uncorked-hub/",
    pages: 9,
    theme: "Wine / Gold",
    color: "bg-rose-800",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function BuildStatusTab() {
  const totalRoutes = routeGroups.reduce((sum, g) => sum + g.pages, 0);

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Build Progress
            </h3>
          </div>
          <span className="text-sm font-bold text-emerald-600">
            100% Complete
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
            style={{ width: "100%" }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          All 5 build terminals completed
        </p>
      </div>

      {/* Terminal Cards */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Build Terminals
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {terminals.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-white border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                    {t.id}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  DONE
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{t.description}</p>
              <ul className="space-y-1.5 mt-auto">
                {t.deliverables.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Module Checklist */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Module Checklist
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-sm font-medium text-gray-900">
                        {m.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-6">
                      {m.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Summary */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Architecture — Route Groups
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
                    Pages
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Theme
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routeGroups.map((g, i) => (
                  <tr
                    key={g.group}
                    className={cn(
                      i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span
                        className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          g.color
                        )}
                      />
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                        {g.group}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {g.pages} pages
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {g.theme}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {totalRoutes} routes
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    5 route groups
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
