"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";

interface CheckinEntry {
  id: string;
  userId: string;
  date: string;
  createdAt: string | Date;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  classification: string;
  company: string;
}

interface SessionData {
  id: string;
  meetingDate: string;
  pin: string;
  openedBy: string | null;
  openedAt: string | Date;
  closedAt: string | Date | null;
  isActive: boolean;
  notes: string;
}

interface AttendeeResponse {
  session: (Omit<SessionData, "pin"> & { pin?: string }) | null;
  checkins: CheckinEntry[];
  count: number;
}

interface MemberResult {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  classification: string;
  company: string;
}

export default function CheckinMonitorPage() {
  const { user, isLoaded } = useUser();

  const [session, setSession] = useState<(Omit<SessionData, "pin"> & { pin?: string }) | null>(null);
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);
  const [count, setCount] = useState(0);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Session form
  const [formDate, setFormDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [formPin, setFormPin] = useState(() =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  const [formNotes, setFormNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Manual check-in
  const [manualQuery, setManualQuery] = useState("");
  const [manualMembers, setManualMembers] = useState<MemberResult[]>([]);
  const [manualSearching, setManualSearching] = useState(false);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const manualDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevCheckinIds = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin/attendees");
      if (!res.ok) return;
      const data: AttendeeResponse = await res.json();
      setSession(data.session);
      setCount(data.count);

      const incoming = data.checkins ?? [];
      const incomingIds = new Set(incoming.map((c) => c.id));

      // Find newly added entries
      const fresh: string[] = [];
      for (const id of incomingIds) {
        if (!prevCheckinIds.current.has(id)) fresh.push(id);
      }

      if (fresh.length > 0) {
        setNewIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.add(id));
          return next;
        });
        // Remove highlight after 2.5s
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            fresh.forEach((id) => next.delete(id));
            return next;
          });
        }, 2500);
      }

      prevCheckinIds.current = incomingIds;
      setCheckins(incoming);

      // Fetch full session with PIN if session is active
      if (data.session?.id) {
        try {
          const sRes = await fetch(`/api/checkin/session/${data.session.id}`);
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData.session?.pin) setSessionPin(sData.session.pin);
          }
        } catch (error) {
          console.error('Request failed:', error);
          alert('Something went wrong. Please try again.');
          // ignore
        }
      } else {
        setSessionPin(null);
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    poll();
  }, [poll]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [poll]);

  // Manual search debounce
  useEffect(() => {
    if (manualDebounceRef.current) clearTimeout(manualDebounceRef.current);
    if (manualQuery.trim().length < 2) {
      setManualMembers([]);
      setManualSearching(false);
      return;
    }
    setManualSearching(true);
    manualDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/members?search=${encodeURIComponent(manualQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setManualMembers((data.members ?? data.users ?? []).slice(0, 8));
        } else {
          setManualMembers([]);
        }
      } catch (error) {
        console.error('Request failed:', error);
        alert('Something went wrong. Please try again.');
        setManualMembers([]);
      } finally {
        setManualSearching(false);
      }
    }, 300);
  }, [manualQuery]);

  const handleManualCheckin = async (member: MemberResult) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      if (res.ok) {
        setManualSuccess(`${member.firstName} ${member.lastName} checked in`);
        setManualQuery("");
        setManualMembers([]);
        setTimeout(() => setManualSuccess(null), 3000);
        poll();
      }
    } catch (error) {
      console.error('Operation failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore
    }
  };

  const openSession = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch("/api/checkin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingDate: formDate, pin: formPin, notes: formNotes }),
      });
      if (res.ok) {
        await poll();
        setFormNotes("");
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? `Error ${res.status} — check console`);
        console.error("Open session failed:", res.status, data);
      }
    } catch (e) {
      setFormError("Network error — see console");
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const closeSession = async () => {
    if (!session?.id) return;
    await fetch(`/api/checkin/session/${session.id}`, { method: "PATCH" });
    await poll();
  };

  const formatTime = (dt: string | Date) => {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  // Role check
  const roles = (user?.publicMetadata?.roles as string[]) ?? [];
  const hasCheckinAccess = roles.some((r) =>
    ["super_admin", "club_admin", "board_member", "checkin_operator"].includes(r)
  );
  if (!hasCheckinAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">&#x1F512;</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need the check-in operator role to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">&#x2699;&#xFE0F;</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Live Check-In Monitor</h1>
            <p className="text-blue-300 text-sm">Fullerton Rotary Club</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session?.isActive && (
            <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-medium px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Session Active
            </span>
          )}
          <a
            href="/checkin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Launch Kiosk Mode &#x2197;
          </a>
        </div>
      </div>

      <div className="flex gap-0 h-[calc(100vh-68px)]">
        {/* Left column — attendee list */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
          {/* List header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {session?.isActive && session.meetingDate
                  ? `Live Check-In \u2014 ${formatDate(session.meetingDate)}`
                  : "Attendee List"}
              </h2>
              <p className="text-gray-400 text-sm">Auto-refreshes every 5 seconds</p>
            </div>
            <div className="bg-blue-600 text-white text-2xl font-bold w-16 h-16 rounded-2xl flex items-center justify-center shadow">
              {count}
            </div>
          </div>

          {/* Attendee list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {checkins.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-gray-200 text-5xl mb-4">&#x1F4CB;</div>
                <p className="text-gray-400 text-base">
                  {session?.isActive
                    ? "No check-ins yet. Waiting for members..."
                    : "No active check-in session. Open one to the right."}
                </p>
              </div>
            ) : (
              checkins.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 bg-white border rounded-2xl px-5 py-3 shadow-sm transition-colors duration-700 ${
                    newIds.has(entry.id)
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-100"
                  }`}
                >
                  {entry.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photoUrl}
                      alt={`${entry.firstName} ${entry.lastName}`}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold flex-shrink-0">
                      {getInitials(entry.firstName, entry.lastName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">
                      {entry.firstName} {entry.lastName}
                    </div>
                    {(entry.classification || entry.company) && (
                      <div className="text-sm text-gray-400 truncate">
                        {[entry.classification, entry.company].filter(Boolean).join(" \u00B7 ")}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 flex-shrink-0">
                    {formatTime(entry.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-80 flex flex-col overflow-y-auto bg-white">
          {/* Session panel */}
          <div className="border-b border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Session Control
            </h3>

            {session?.isActive ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm">
                  <div className="text-green-700 font-medium mb-1">Active session</div>
                  <div className="text-gray-600">
                    Date:{" "}
                    <span className="font-medium">
                      {session.meetingDate ? formatDate(session.meetingDate) : "\u2014"}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    PIN:{" "}
                    <span className="font-mono font-bold text-gray-900 text-base tracking-widest">
                      {sessionPin ?? "\u2022\u2022\u2022\u2022"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeSession}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Close Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Meeting Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">PIN</label>
                  <input
                    type="text"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    maxLength={8}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. 1234"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. Speaker meeting"
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
                    {formError}
                  </div>
                )}
                <button
                  onClick={openSession}
                  disabled={formLoading || !formDate || !formPin}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {formLoading ? "Opening..." : "Open Check-In Session"}
                </button>
              </div>
            )}
          </div>

          {/* Manual check-in panel */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Manual Check-In
            </h3>

            {!session?.isActive ? (
              <p className="text-gray-400 text-sm">Open a session to enable manual check-in.</p>
            ) : (
              <>
                {manualSuccess && (
                  <div className="mb-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-3 py-2">
                    {manualSuccess}
                  </div>
                )}
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Search member name..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors mb-2"
                  autoComplete="off"
                />
                {manualSearching && (
                  <p className="text-gray-300 text-xs mb-2">Searching...</p>
                )}
                <div className="space-y-1.5">
                  {manualMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleManualCheckin(m)}
                      className="w-full flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl px-3 py-2.5 text-left transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(m.firstName, m.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {m.firstName} {m.lastName}
                        </div>
                        {m.classification && (
                          <div className="text-xs text-gray-400 truncate">{m.classification}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
