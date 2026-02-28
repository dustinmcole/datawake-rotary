"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { CalendarDays, MapPin, Clock, Loader2, CheckCircle2, Send, ExternalLink, Users, Plus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type ClubEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  rsvpUrl: string;
  isPublic: boolean;
  status: string;
  submittedBy: string | null;
  rsvpCount?: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  meeting: "bg-blue-100 text-blue-700",
  service: "bg-green-100 text-green-700",
  social: "bg-pink-100 text-pink-700",
  fundraiser: "bg-amber-100 text-amber-700",
  speaker: "bg-purple-100 text-purple-700",
  general: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [myEvents, setMyEvents] = useState<ClubEvent[]>([]);
  const [rsvpedIds, setRsvpedIds] = useState<Set<string>>(new Set());
  const [rsvpingId, setRsvpingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("general");
  const [rsvpUrl, setRsvpUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/events-club?upcoming=true").then((r) => r.json()),
      fetch("/api/events-club?mine=true").then((r) => r.json()),
    ])
      .then(([upcoming, mine]) => {
        setUpcomingEvents(Array.isArray(upcoming) ? upcoming : []);
        setMyEvents(Array.isArray(mine) ? mine : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleRsvp(eventId: string) {
    if (rsvpedIds.has(eventId)) {
      // Un-RSVP
      setRsvpingId(eventId);
      try {
        await fetch(`/api/events-club/${eventId}/rsvp`, { method: "DELETE" });
        setRsvpedIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        setUpcomingEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, rsvpCount: Math.max(0, (e.rsvpCount ?? 1) - 1) } : e
          )
        );
      } finally {
        setRsvpingId(null);
      }
    } else {
      // RSVP
      setRsvpingId(eventId);
      try {
        const res = await fetch(`/api/events-club/${eventId}/rsvp`, { method: "POST" });
        if (res.ok) {
          setRsvpedIds((prev) => new Set([...prev, eventId]));
          setUpcomingEvents((prev) =>
            prev.map((e) =>
              e.id === eventId ? { ...e, rsvpCount: (e.rsvpCount ?? 0) + 1 } : e
            )
          );
        }
      } finally {
        setRsvpingId(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/events-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date,
          startTime,
          endTime,
          location,
          category,
          rsvpUrl,
          isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to submit event");
        return;
      }
      setMyEvents((prev) => [data, ...prev]);
      setSubmitted(true);
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setCategory("general");
      setRsvpUrl("");
      setIsPublic(false);
      setTimeout(() => setSubmitted(false), 5000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500">Upcoming events and submit new ones</p>
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <Tabs.Trigger
            value="upcoming"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Upcoming Events
          </Tabs.Trigger>
          <Tabs.Trigger
            value="submit"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "submit"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Event
          </Tabs.Trigger>
        </Tabs.List>

        {/* Upcoming Events Tab */}
        <Tabs.Content value="upcoming" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                      <div className="h-3.5 w-64 bg-gray-100 rounded mb-2" />
                      <div className="h-3.5 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming events</p>
              <p className="text-sm text-gray-400 mt-1">
                Check back later, or{" "}
                <button
                  onClick={() => setActiveTab("submit")}
                  className="text-blue-600 hover:underline"
                >
                  submit an event
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date + "T00:00:00");
                const isRsvped = rsvpedIds.has(event.id);
                const cat = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.general;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                          <span className="text-[10px] text-blue-500 font-semibold uppercase leading-none">
                            {d.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-xl font-bold text-blue-700 leading-tight">
                            {d.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                            <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium capitalize", cat)}>
                              {event.category}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                          )}

                          <div className="flex flex-wrap gap-3 mt-3">
                            {(event.startTime || event.date) && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                                {event.startTime && ` · ${event.startTime}`}
                                {event.endTime && ` – ${event.endTime}`}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                              </span>
                            )}
                            {(event.rsvpCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Users className="w-3.5 h-3.5" />
                                {event.rsvpCount} RSVP{event.rsvpCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleRsvp(event.id)}
                              disabled={rsvpingId === event.id}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                isRsvped
                                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              )}
                            >
                              {rsvpingId === event.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isRsvped ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : null}
                              {isRsvped ? "RSVP'd · Cancel?" : "RSVP"}
                            </button>
                            {event.rsvpUrl && (
                              <a
                                href={event.rsvpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                External RSVP
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Tabs.Content>

        {/* Submit Event Tab */}
        <Tabs.Content value="submit" className="mt-6 space-y-6">
          {/* Submit form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Submit a New Event</h2>

            {submitted && (
              <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Event submitted!</p>
                  <p className="text-xs text-green-600">
                    It will appear on the calendar after admin approval.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Event Title" required>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Annual Pancake Breakfast"
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FormField label="Date" required>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </FormField>
                <FormField label="Start Time">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </FormField>
                <FormField label="End Time">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Location">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Coyote Hills Country Club"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </FormField>
                <FormField label="Category" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="service">Service Project</option>
                    <option value="social">Social</option>
                    <option value="fundraiser">Fundraiser</option>
                    <option value="speaker">Speaker</option>
                    <option value="general">General</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell members about this event…"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                />
              </FormField>

              <FormField label="RSVP Link" hint="Optional — for external ticketing or sign-up">
                <input
                  type="url"
                  value={rsvpUrl}
                  onChange={(e) => setRsvpUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </FormField>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Make this event public on the club website
                </span>
              </label>

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Submitting…" : "Submit Event"}
              </button>
            </form>
          </div>

          {/* My submitted events */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Submitted Events</h2>
              <p className="text-xs text-gray-400 mt-0.5">Events you&apos;ve submitted for approval</p>
            </div>
            {myEvents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No events submitted yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {event.date}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 capitalize",
                        STATUS_COLORS[event.status] ?? "bg-gray-50 text-gray-600 border border-gray-200"
                      )}
                    >
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
