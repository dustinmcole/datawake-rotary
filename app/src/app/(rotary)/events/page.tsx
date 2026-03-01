import { getApprovedPublicEvents } from "@/lib/queries/events-club";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Events",
  description: "Upcoming events, service projects, socials, and meetings from the Rotary Club of Fullerton.",
};

const categoryColors: Record<string, string> = {
  meeting: "bg-navy-700 text-white",
  service: "bg-green-600 text-white",
  social: "bg-purple-600 text-white",
  fundraiser: "bg-gold-600 text-white",
  speaker: "bg-blue-600 text-white",
  general: "bg-gray-500 text-white",
};

function getCategoryBadge(category: string | null | undefined) {
  if (!category) return null;
  const colorClass = categoryColors[category.toLowerCase()] || categoryColors.general;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${colorClass}`}
    >
      {category}
    </span>
  );
}

function truncate(text: string | null | undefined, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof getApprovedPublicEvents>> = [];
  try {
    events = await getApprovedPublicEvents();
  } catch (error) {
    console.error('Request failed:', error);
    events = [];
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter((e) => e.date >= today);
  const pastEvents = events.filter((e) => e.date < today);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-navy-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Events</h1>
          <p className="mt-3 text-lg text-navy-100">
            Stay connected with club activities and community events
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-6">
            Upcoming Events
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug || event.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-navy-300 transition-all duration-200"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-navy-900 group-hover:text-navy-700 transition-colors leading-snug">
                        {event.title}
                      </h3>
                      {getCategoryBadge(event.category)}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-navy-500 shrink-0" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-navy-500 shrink-0" />
                          <span>
                            {event.startTime}
                            {event.endTime ? ` \u2013 ${event.endTime}` : ""}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-navy-500 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                        {truncate(event.description, 150)}
                      </p>
                    )}

                    <div className="flex items-center text-sm font-medium text-navy-600 group-hover:text-navy-800 mt-auto pt-2">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No upcoming events at the moment
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Check back soon or{" "}
                <Link
                  href="/contact"
                  className="text-navy-600 hover:text-navy-800 underline underline-offset-2"
                >
                  contact us
                </Link>{" "}
                for meeting times.
              </p>
            </div>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-600 mb-4">
              Past Events
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {pastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug || event.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-sm text-gray-400 w-28 shrink-0">
                      {formatDate(event.date)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-navy-700 transition-colors truncate block">
                        {event.title}
                      </span>
                      {event.location && (
                        <span className="text-xs text-gray-400 truncate block">
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getCategoryBadge(event.category)}
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-navy-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Meeting Reminder */}
        <section>
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-8">
            <div className="flex items-start gap-5">
              <div className="bg-navy-700 rounded-lg p-3 shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 mb-1">
                  Join Us Every Wednesday
                </h3>
                <p className="text-navy-700 mb-1">
                  Weekly meetings are held <strong>12:00 &ndash; 1:30 PM</strong> at{" "}
                  <strong>Coyote Hills Country Club</strong>, Fullerton.
                </p>
                <p className="text-sm text-navy-600 mb-4">
                  Guests are always welcome. Come see what Rotary is all about.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors"
                >
                  Get Directions & Contact Info
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
