"use client";

import {
  Bot,
  Shield,
  Lock,
  Users,
  Globe,
  BarChart3,
  Wine,
  Wrench,
  Heart,
  MessageSquare,
  AlertTriangle,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Context Config ─────────────────────────────────────────────────────────

type ContextKey = "member" | "website" | "operations" | "uncorked";

const contexts: {
  key: ContextKey;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: "member",
    label: "Member",
    description: "General Q&A — directory, events, attendance, clubs",
    icon: Users,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    key: "website",
    label: "Website",
    description: "CMS management — viewing/editing public pages",
    icon: Globe,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    key: "operations",
    label: "Operations",
    description: "Admin tasks — reports, announcements, event mgmt",
    icon: BarChart3,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    key: "uncorked",
    label: "Uncorked",
    description: "Fundraiser planning — sponsors, vendors, budget",
    icon: Wine,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
];

// ── Tools Data ─────────────────────────────────────────────────────────────

const toolsByContext: {
  context: ContextKey;
  tools: { name: string; requiredRoles: string }[];
}[] = [
  {
    context: "member",
    tools: [
      { name: "search_directory", requiredRoles: "member+" },
      { name: "get_upcoming_events", requiredRoles: "member+" },
      { name: "get_my_attendance", requiredRoles: "member+" },
      { name: "get_club_info", requiredRoles: "member+" },
      { name: "get_committee_info", requiredRoles: "member+" },
    ],
  },
  {
    context: "website",
    tools: [
      { name: "get_page_content", requiredRoles: "website_admin, club_admin, super_admin" },
      { name: "edit_page_content", requiredRoles: "website_admin, club_admin, super_admin" },
      { name: "list_pages", requiredRoles: "website_admin, club_admin, super_admin" },
    ],
  },
  {
    context: "operations",
    tools: [
      { name: "get_attendance_report", requiredRoles: "board_member, club_admin, super_admin" },
      { name: "get_membership_report", requiredRoles: "board_member, club_admin, super_admin" },
      { name: "create_announcement", requiredRoles: "club_admin, super_admin" },
      { name: "manage_event", requiredRoles: "club_admin, super_admin" },
      { name: "get_pending_events", requiredRoles: "club_admin, super_admin" },
      { name: "get_membership_inquiries", requiredRoles: "club_admin, super_admin" },
    ],
  },
  {
    context: "uncorked",
    tools: [
      { name: "search_sponsors", requiredRoles: "uncorked_committee, club_admin, super_admin" },
      { name: "search_vendors", requiredRoles: "uncorked_committee, club_admin, super_admin" },
      { name: "get_budget_summary", requiredRoles: "uncorked_committee, club_admin, super_admin" },
    ],
  },
];

const contextColors: Record<ContextKey, { bg: string; text: string; border: string }> = {
  member: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  website: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  operations: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  uncorked: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

// ── Agent Rules ────────────────────────────────────────────────────────────

const agentRules = [
  "Always confirm before making changes",
  "Never reveal internal system details",
  "Cannot modify own configuration",
  "Protect member contact information",
  "Financial questions — consult treasurer",
  "If missing tool/data, say so honestly",
];

// ── Personality Traits ─────────────────────────────────────────────────────

const personalityTraits: { trait: string; description: string }[] = [
  { trait: "Warm and professional", description: "Friendly but never casual or flippant" },
  {
    trait: 'Service-oriented',
    description: 'Embodies Rotary\'s motto "Service Above Self"',
  },
  { trait: "Proactive but respectful", description: "Suggests actions without overstepping" },
  { trait: "Clear and concise", description: "Gets to the point without unnecessary verbosity" },
  {
    trait: 'Uses "we" language',
    description: "Speaks as part of the club, not as an outsider",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function BrynConfigTab() {
  return (
    <div className="space-y-8">
      {/* Identity Card */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Agent Identity
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 flex-1">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Name
                </p>
                <p className="text-sm font-semibold text-gray-900">Bryn</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Runtime
                </p>
                <p className="text-sm font-semibold text-gray-900">OpenClaw</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Model
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Claude Sonnet 4.6
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Managed by
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Datawake (datawake.io)
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Primary Contact
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Dustin Cole (dustin@datawake.io)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personality Traits */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Personality Traits
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="space-y-3">
            {personalityTraits.map((t) => (
              <div
                key={t.trait}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50"
              >
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t.trait}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Contexts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Agent Contexts
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contexts.map((ctx) => {
            const Icon = ctx.icon;
            return (
              <div
                key={ctx.key}
                className={cn(
                  "rounded-xl border p-5",
                  ctx.bgColor,
                  ctx.borderColor
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center bg-white/70"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", ctx.color)} />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold uppercase tracking-wide",
                      ctx.color
                    )}
                  >
                    {ctx.label}
                  </span>
                </div>
                <p className={cn("text-sm", ctx.color, "opacity-80")}>
                  {ctx.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tools by Context */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Tools by Context
          </h3>
          <span className="ml-auto text-xs text-gray-400">17 tools total</span>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Context
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tool
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Required Roles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {toolsByContext.flatMap((group) =>
                  group.tools.map((tool, i) => {
                    const colors = contextColors[group.context];
                    return (
                      <tr
                        key={`${group.context}-${tool.name}`}
                        className={cn(
                          i === 0 && group.context !== "member"
                            ? "border-t-2 border-gray-200"
                            : ""
                        )}
                      >
                        <td className="px-4 py-2.5">
                          {i === 0 && (
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold",
                                colors.bg,
                                colors.text,
                                colors.border
                              )}
                            >
                              {group.context}
                              <span className="ml-1 text-[10px] opacity-60">
                                ({group.tools.length})
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                            {tool.name}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-500">
                          {tool.requiredRoles}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Agent Rules */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Agent Rules</h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <ol className="space-y-3">
            {agentRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 pt-0.5">{rule}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Security & Governance */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Security & Governance
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Fingerprint className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Config Governance
              </p>
              <p className="text-sm text-gray-600">
                ONLY Dustin can modify Bryn&apos;s configuration. No club member
                or admin can alter agent behavior, tools, or system prompt.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Mutation Safety
              </p>
              <p className="text-sm text-gray-600">
                All mutations (edits, announcements, event changes) require
                explicit user confirmation before execution.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Runtime Filtering
              </p>
              <p className="text-sm text-gray-600">
                Tool access is filtered by the authenticated user&apos;s roles
                at runtime. Users only see tools their role level permits.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
