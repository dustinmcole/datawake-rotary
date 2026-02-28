"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Database,
  Bot,
  Cloud,
  CheckCircle2,
  XCircle,
  Server,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  configured: boolean;
  label: string;
  latency?: number;
}

interface HealthData {
  envVars: Record<string, boolean>;
  dbConnected: boolean;
  dbLatency: number;
  integrations: Record<string, Integration>;
  timestamp: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full shrink-0",
        active ? "bg-emerald-500" : "bg-red-500"
      )}
    />
  );
}

export default function EnvironmentTab() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/planning/health")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        return res.json();
      })
      .then((d) => setData(d as HealthData))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
        Failed to load health data: {error}
      </div>
    );
  }

  if (!data) return null;

  const integrationIcons: Record<string, React.ElementType> = {
    clerk: Shield,
    neon: Database,
    anthropic: Bot,
    vercel: Cloud,
  };

  const integrationColors: Record<string, { bg: string; icon: string }> = {
    clerk: { bg: "bg-purple-50", icon: "text-purple-600" },
    neon: { bg: "bg-emerald-50", icon: "text-emerald-600" },
    anthropic: { bg: "bg-blue-50", icon: "text-blue-600" },
    vercel: { bg: "bg-gray-50", icon: "text-gray-700" },
  };

  return (
    <div className="space-y-8">
      {/* Deployment Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Deployment Info
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Platform
              </p>
              <p className="text-sm font-medium text-gray-900">
                {data.integrations.vercel?.configured ? "Vercel" : "Local Dev"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Framework
              </p>
              <p className="text-sm font-medium text-gray-900">
                Next.js 16.1.6
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Runtime
              </p>
              <p className="text-sm font-medium text-gray-900">Node.js</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Region
              </p>
              <p className="text-sm font-medium text-gray-900">
                {data.integrations.vercel?.configured ? "Auto (Vercel)" : "local"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Status */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Integration Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(data.integrations).map(([key, integration]) => {
            const Icon = integrationIcons[key] ?? Settings;
            const colors = integrationColors[key] ?? { bg: "bg-gray-50", icon: "text-gray-600" };
            return (
              <div
                key={key}
                className="rounded-xl bg-white border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      colors.bg
                    )}
                  >
                    <Icon className={cn("w-5 h-5", colors.icon)} />
                  </div>
                  <StatusDot active={!!integration.configured} />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  {integration.label}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    integration.configured ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {integration.configured
                    ? key === "neon" && integration.latency !== undefined
                      ? `Connected (${integration.latency}ms)`
                      : "Connected"
                    : "Not configured"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Environment Variables Checklist */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Environment Variables
          </h3>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(data.envVars).map(([name, isSet]) => (
              <div
                key={name}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50"
              >
                {isSet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <code className="text-xs font-mono text-gray-700">{name}</code>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Last checked: {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>
      </section>
    </div>
  );
}
