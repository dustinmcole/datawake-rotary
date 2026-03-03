"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  classification: string;
  company: string;
}

type OverlayState =
  | { type: "none" }
  | { type: "success"; name: string }
  | { type: "already"; name: string }
  | { type: "loading" };

export default function CheckinPage() {
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);

  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>({ type: "none" });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin/session");
      const data = await res.json();
      if (data.session?.isActive) {
        setSessionActive(true);
        setSessionDate(data.session.meetingDate);
      } else {
        setSessionActive(false);
        setSessionDate(null);
      }
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      setSessionActive(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 15000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Debounced member search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setMembers([]);
      setNoResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/checkin?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) {
          setMembers([]);
          setSearching(false);
          return;
        }
        const data = await res.json();
        setMembers(data.members ?? []);
        setNoResults((data.members ?? []).length === 0);
      } catch (error) {
        console.error('Request failed:', error);
        toast.error('Something went wrong. Please try again.');
        setMembers([]);
        setNoResults(false);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  const handleCheckin = async (member: Member) => {
    setOverlay({ type: "loading" });
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOverlay({ type: "none" });
        return;
      }
      const reset = () => {
        setOverlay({ type: "none" });
        setQuery("");
        setMembers([]);
        inputRef.current?.focus();
      };
      if (data.alreadyCheckedIn) {
        setOverlay({ type: "already", name: member.firstName });
        setTimeout(reset, 2000);
      } else {
        setOverlay({ type: "success", name: member.firstName });
        setTimeout(reset, 2500);
      }
    } catch (error) {
      console.error('Operation failed:', error);
      toast.error('Something went wrong. Please try again.');
      setOverlay({ type: "none" });
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  if (sessionActive === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  const showOverlay = overlay.type !== "none";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-10 px-6 pb-10 relative select-none">
      {showOverlay && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all ${
            overlay.type === "success"
              ? "bg-green-500"
              : overlay.type === "already"
              ? "bg-blue-500"
              : "bg-white/80"
          }`}
        >
          {overlay.type === "loading" ? (
            <div className="text-gray-600 text-2xl font-medium">Checking in...</div>
          ) : overlay.type === "success" ? (
            <>
              <div className="text-white text-8xl mb-6">&#x2713;</div>
              <div className="text-white text-5xl font-bold text-center px-8">
                Welcome, {overlay.name}!
              </div>
              <div className="text-white/80 text-xl mt-4">Checked in successfully</div>
            </>
          ) : (
            <>
              <div className="text-white text-7xl mb-6">&#x1F44B;</div>
              <div className="text-white text-4xl font-bold text-center px-8">
                Already checked in today, {overlay.name}!
              </div>
            </>
          )}
        </div>
      )}

      <div className="text-center mb-8 mt-2">
        <div className="text-5xl mb-3">&#x2699;&#xFE0F;</div>
        <h1 className="text-3xl font-bold text-blue-900">Fullerton Rotary Club</h1>
        <p className="text-gray-500 text-lg mt-1">Weekly Lunch Check-In</p>
        {sessionDate && (
          <div className="inline-block mt-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full">
            {formatDate(sessionDate)}
          </div>
        )}
      </div>

      {!sessionActive ? (
        <div className="w-full max-w-md">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-10 text-center">
            <div className="text-gray-300 text-5xl mb-4">&#x1F512;</div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Check-in is not open yet</h2>
            <p className="text-gray-400">Please see the host to get started.</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing your name..."
            className="w-full h-[72px] text-2xl px-6 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none shadow-lg transition-colors bg-white placeholder:text-gray-300"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            autoFocus
          />
          {noResults && !searching && query.trim().length >= 2 && (
            <div className="mt-4 text-center text-gray-400 text-lg">
              No match found &mdash; see the host
            </div>
          )}
          {searching && (
            <div className="mt-4 text-center text-gray-300 text-base">Searching...</div>
          )}
          {members.length > 0 && (
            <div className="mt-3 space-y-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleCheckin(m)}
                  className="w-full flex items-center gap-4 bg-white border border-gray-100 hover:border-blue-300 hover:bg-blue-50 rounded-2xl px-5 shadow-sm active:scale-[0-98] transition-all min-h-[80px] text-left"
                >
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={`${m.firstName} ${m.lastName}`}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {getInitials(m.firstName, m.lastName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-semibold text-gray-900">
                      {m.firstName} {m.lastName}
                    </div>
                    {(m.classification || m.company) && (
                      <div className="text-sm text-gray-400 truncate">
                        {[m.classification, m.company].filter(Boolean).join(" \u00B7 ")}
                      </div>
                    )}
                  </div>
                  <div className="text-blue-400 text-2xl flex-shrink-0">&rarr;</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
