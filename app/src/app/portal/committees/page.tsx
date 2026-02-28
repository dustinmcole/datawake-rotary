"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, ChevronRight, UserPlus, Users, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Committee = {
  id: string;
  name: string;
  description: string;
  chairUserId: string | null;
  category: string;
  active: boolean;
};

type CommitteeWithMembers = Committee & {
  members: {
    membership: { id: string; role: string };
    user: {
      id: string;
      firstName: string;
      lastName: string;
      classification: string;
      photoUrl: string | null;
    };
  }[];
};

const CATEGORY_LABELS: Record<string, string> = {
  standing: "Standing Committee",
  special: "Special Committee",
  ad_hoc: "Ad Hoc Committee",
};

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [membersMap, setMembersMap] = useState<Record<string, CommitteeWithMembers>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [myCommitteeIds, setMyCommitteeIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/committees-club").then((r) => r.json()),
      fetch("/api/committees-club/mine").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([committeeData, myCommittees]) => {
        setCommittees(Array.isArray(committeeData) ? committeeData : []);
        const ids = Array.isArray(myCommittees) ? myCommittees.map((c: Committee) => c.id) : [];
        setMyCommitteeIds(new Set(ids));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!membersMap[id]) {
      setLoadingId(id);
      try {
        const res = await fetch(`/api/committees-club/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMembersMap((prev) => ({ ...prev, [id]: data }));
        }
      } finally {
        setLoadingId(null);
      }
    }
  }

  async function handleJoin(committeeId: string) {
    setJoiningId(committeeId);
    try {
      const res = await fetch(`/api/committees-club/${committeeId}/join`, {
        method: "POST",
      });
      if (res.ok) {
        setMyCommitteeIds((prev) => new Set([...prev, committeeId]));
        setJoinedIds((prev) => new Set([...prev, committeeId]));
        // Refresh members
        const updated = await fetch(`/api/committees-club/${committeeId}`).then((r) =>
          r.ok ? r.json() : null
        );
        if (updated) {
          setMembersMap((prev) => ({ ...prev, [committeeId]: updated }));
        }
      }
    } finally {
      setJoiningId(null);
    }
  }

  const grouped = committees.reduce<Record<string, Committee[]>>((acc, c) => {
    const cat = c.category || "standing";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
          <p className="text-sm text-gray-500">Browse club committees and request to join</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-72 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : committees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No committees yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Club committees will appear here once they&apos;re added.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[cat] ?? cat}s
              </h2>
              <div className="space-y-2">
                {items.map((committee) => {
                  const isExpanded = expanded === committee.id;
                  const isMine = myCommitteeIds.has(committee.id);
                  const isJoined = joinedIds.has(committee.id);
                  const detail = membersMap[committee.id];
                  const memberCount = detail?.members?.length ?? "—";

                  return (
                    <div
                      key={committee.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Committee header row */}
                      <button
                        onClick={() => toggleExpand(committee.id)}
                        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{committee.name}</p>
                            {isMine && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                Member
                              </span>
                            )}
                          </div>
                          {committee.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                              {committee.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-gray-400 hidden sm:block">
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            {memberCount} member{memberCount !== 1 ? "s" : ""}
                          </span>
                          {loadingId === committee.id ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded members */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-6 py-4">
                          {!detail ? (
                            <div className="py-4 flex justify-center">
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                          ) : detail.members?.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2 text-center">
                              No members yet.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              {detail.members?.map(({ membership, user }) => (
                                <div
                                  key={membership.id}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                >
                                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs flex-shrink-0">
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">
                                      {membership.role}
                                      {user.classification
                                        ? ` · ${user.classification}`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Join button */}
                          {!isMine && (
                            <button
                              onClick={() => handleJoin(committee.id)}
                              disabled={joiningId === committee.id || isJoined}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                isJoined
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              )}
                            >
                              {joiningId === committee.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isJoined ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              {isJoined ? "Joined!" : "Request to Join"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
