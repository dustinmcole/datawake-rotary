"use client";

import {
  Settings,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  Shield,
  Bot,
  Globe,
  Lock,
  Mail,
} from "lucide-react";

// Club information is currently static (club details from master plan).
// In the future, this should be stored in a club_settings table and editable.

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Platform configuration and integration status</p>
        </div>
      </div>

      {/* Club Information */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          Club Information
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="divide-y divide-gray-100">
            <SettingRow label="Club Name" value="Rotary Club of Fullerton (South)" icon={Building2} />
            <SettingRow label="Meeting Day & Time" value="Thursdays at 12:15 PM" icon={Clock} />
            <SettingRow label="Meeting Location" value="TBD — please confirm with Leslie" icon={MapPin} />
            <SettingRow label="District" value="District 5320" icon={Globe} />
            <SettingRow label="Club Website" value="fullertonrotaryclub.com" icon={Globe} />
          </div>
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Club information editing will be available in a future update. Contact Datawake to update this information.
          </div>
        </div>
      </section>

      {/* Integration Status */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-gray-500" />
          Integration Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IntegrationCard
            name="Clerk Authentication"
            description="Member login, RBAC, invitation management"
            status="connected"
            icon={Shield}
            detail="8 roles configured"
          />
          <IntegrationCard
            name="Neon PostgreSQL"
            description="Primary database — 21 tables"
            status="connected"
            icon={Database}
            detail="Hosted on Neon (serverless)"
          />
          <IntegrationCard
            name="Vercel"
            description="Hosting & deployment"
            status="connected"
            icon={Globe}
            detail="Auto-deploys from main branch"
          />
          <IntegrationCard
            name="Bryn AI Assistant"
            description="Role-aware AI chatbot"
            status="pending"
            icon={Bot}
            detail="Terminal 4 — in progress"
          />
          <IntegrationCard
            name="Email Notifications"
            description="Announcement delivery, invitations"
            status="pending"
            icon={Mail}
            detail="Resend integration planned"
          />
        </div>
      </section>

      {/* Bryn Governance */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-gray-500" />
          Bryn AI Configuration
        </h2>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-blue-900">Bryn is managed by Datawake</h3>
              <p className="text-sm text-blue-700 mt-1.5 leading-relaxed">
                Bryn&apos;s configuration — including skills, tools, personality, permissions, and scheduled tasks
                — is managed exclusively by Datawake. Club administrators and members can <em>use</em> Bryn,
                but cannot modify her configuration.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                To request changes to Bryn&apos;s behavior, contact{" "}
                <a href="mailto:dustin@datawake.io" className="underline font-medium hover:text-blue-900">
                  dustin@datawake.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-500" />
          Advanced
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Member Data</p>
              <p className="text-xs text-gray-500 mt-0.5">Download all member records as CSV</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Database Status</p>
              <p className="text-xs text-gray-500 mt-0.5">Neon PostgreSQL — 21 tables</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Platform Version</p>
              <p className="text-xs text-gray-500 mt-0.5">Next.js 16.1.6 · Clerk 6 · Drizzle ORM</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">v1.0</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  status,
  icon: Icon,
  detail,
}: {
  name: string;
  description: string;
  status: "connected" | "pending" | "error";
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
}) {
  const statusConfig = {
    connected: { label: "Connected", color: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
    pending: { label: "Pending", color: "text-amber-700 bg-amber-50", dot: "bg-amber-400" },
    error: { label: "Error", color: "text-red-700 bg-red-50", dot: "bg-red-500" },
  };
  const s = statusConfig[status];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${s.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        {detail && <p className="text-[11px] text-gray-400 mt-1">{detail}</p>}
      </div>
    </div>
  );
}
