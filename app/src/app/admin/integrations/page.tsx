"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  List,
  Clock,
  AlertCircle,
  ChevronDown,
  LogOut,
  Zap,
} from "lucide-react";

type Segment = "all_members" | "board" | "external_community" | "potential_members" | "full_list";

const SEGMENT_LABELS: Record<Segment, string> = {
  all_members: "All Members",
  board: "Board",
  external_community: "External / Community",
  potential_members: "Potential Members",
  full_list: "Full List",
};
const ALL_SEGMENTS = Object.keys(SEGMENT_LABELS) as Segment[];

interface CCList { list_id: string; name: string; membership_count?: number }
interface Mapping { segment: string; ccListId: string; ccListName: string; enabled: boolean }
interface SyncLog {
  id: string;
  segment: string;
  status: "success" | "partial" | "failed";
  recordsSynced: number;
  recordsFailed: number;
  errorMessage?: string;
  triggeredBy: string;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [connected, setConnected] = useState(false);
  const [schedule, setSchedule] = useState<"manual" | "nightly" | "weekly">("manual");
  const [ccLists, setCcLists] = useState<CCList[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/constant-contact/status");
      const data = await res.json();
      setConnected(data.connected ?? false);
      setSchedule(data.syncSchedule ?? "manual");
      setMappings(data.mappings ?? []);
    } catch { /* ignore */ }
    try {
      const res = await fetch("/api/integrations/constant-contact/logs?limit=30");
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const loadCcLists = async () => {
    setListsLoading(true);
    try {
      const res = await fetch("/api/integrations/constant-contact/lists");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCcLists(data);
        else setError("Failed to fetch CC lists");
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to fetch lists");
      }
    } catch { setError("Network error"); }
    setListsLoading(false);
  };

  useEffect(() => {
    loadStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") flash("Successfully connected to Constant Contact!");
    if (params.get("error")) setError(`OAuth error: ${params.get("error")}`);
  }, [loadStatus]);

  useEffect(() => {
    if (connected) loadCcLists();
  }, [connected]);

  const handleConnect = () => {
    window.location.href = "/api/integrations/constant-contact/auth";
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Constant Contact? Sync will stop until reconnected.")) return;
    await fetch("/api/integrations/constant-contact/disconnect", { method: "POST" });
    setConnected(false);
    flash("Disconnected.");
  };

  const handleSync = async (segment: Segment | "all") => {
    setSyncing(segment);
    setError(null);
    try {
      const res = await fetch("/api/integrations/constant-contact/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sync failed"); return; }
      flash(segment === "all" ? "All segments synced!" : `Synced ${SEGMENT_LABELS[segment]}!`);
      await loadStatus();
    } catch { setError("Network error during sync"); }
    setSyncing(null);
  };

  const handleMappingChange = async (segment: Segment, listId: string) => {
    const list = ccLists.find((l) => l.list_id === listId);
    await fetch("/api/integrations/constant-contact/mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment, ccListId: listId, ccListName: list?.name ?? "" }),
    });
    setMappings((prev) => {
      const next = prev.filter((m) => m.segment !== segment);
      return [...next, { segment, ccListId: listId, ccListName: list?.name ?? "", enabled: true }];
    });
  };

  const handleScheduleChange = async (s: "manual" | "nightly" | "weekly") => {
    setSchedule(s);
    await fetch("/api/integrations/constant-contact/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncSchedule: s }),
    });
    flash("Schedule updated.");
  };

  const getMappingForSegment = (segment: Segment) =>
    mappings.find((m) => m.segment === segment);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <Plug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500">Connect your Constant Contact account and manage email list sync</p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button className="ml-auto text-red-500 hover:text-red-700" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Connection Card */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          Constant Contact
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connected ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {connected ? "Connected" : "Not connected"}
                </p>
                <p className="text-xs text-gray-500">
                  {connected
                    ? "OAuth 2.0 connection active — contacts will sync to your CC lists"
                    : "Connect your Constant Contact account to enable email list sync"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {connected ? (
                <>
                  <button
                    onClick={() => loadCcLists()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    disabled={listsLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${listsLoading ? "animate-spin" : ""}`} />
                    Refresh Lists
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-3 h-3" />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plug className="w-3.5 h-3.5" />
                  Connect Constant Contact
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {connected && (
        <>
          {/* Sync Schedule */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Sync Schedule
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600 mb-4">
                Choose how often member data is pushed to Constant Contact. Manual means you trigger each sync.
              </p>
              <div className="flex gap-3">
                {(["manual", "nightly", "weekly"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleScheduleChange(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      schedule === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {s === "manual" ? "Manual only" : s === "nightly" ? "Nightly" : "Weekly"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Note: Scheduled syncs require a cron job or external scheduler to call the sync API endpoint.
              </p>
            </div>
          </section>

          {/* Segment Mappings */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <List className="w-4 h-4 text-gray-500" />
                Segment Mappings
              </h2>
              <button
                onClick={() => handleSync("all")}
                disabled={syncing !== null}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${syncing === "all" ? "animate-pulse" : ""}`} />
                {syncing === "all" ? "Syncing…" : "Sync All"}
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="divide-y divide-gray-100">
                {ALL_SEGMENTS.map((segment) => {
                  const mapping = getMappingForSegment(segment);
                  return (
                    <div key={segment} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{SEGMENT_LABELS[segment]}</p>
                        <p className="text-xs text-gray-500">
                          {mapping?.ccListName ? `→ ${mapping.ccListName}` : "Not mapped to a CC list"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <select
                            value={mapping?.ccListId ?? ""}
                            onChange={(e) => handleMappingChange(segment, e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">— select list —</option>
                            {ccLists.map((l) => (
                              <option key={l.list_id} value={l.list_id}>{l.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleSync(segment)}
                          disabled={syncing !== null || !mapping?.ccListId}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncing === segment ? "animate-spin" : ""}`} />
                          {syncing === segment ? "Syncing…" : "Sync"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {ccLists.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 mt-2">
                No CC lists loaded. Click &quot;Refresh Lists&quot; to fetch your Constant Contact lists.
              </p>
            )}
          </section>

          {/* Sync Logs */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Sync Logs
            </h2>
            {logs.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-400">
                No sync activity yet. Run a sync to get started.
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">Timestamp</th>
                      <th className="px-5 py-3 text-left">Segment</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Synced</th>
                      <th className="px-5 py-3 text-left">Failed</th>
                      <th className="px-5 py-3 text-left">Trigger</th>
                      <th className="px-5 py-3 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {SEGMENT_LABELS[log.segment as Segment] ?? log.segment}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === "success"
                              ? "bg-green-100 text-green-700"
                              : log.status === "partial"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {log.status === "success" ? "✓" : log.status === "partial" ? "~" : "✗"}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{log.recordsSynced}</td>
                        <td className="px-5 py-3 text-gray-700">{log.recordsFailed}</td>
                        <td className="px-5 py-3 text-gray-500 capitalize">{log.triggeredBy}</td>
                        <td className="px-5 py-3 text-red-600 text-xs max-w-[200px] truncate">
                          {log.errorMessage ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
