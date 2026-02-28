import { getClubEventBySlug } from "@/lib/queries/events-club";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ExternalLink,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  meeting: "bg-navy-700 text-white",
  service: "bg-green-600 text-white",
  social: "bg-purple-600 text-white",
  fundraiser: "bg-gold-600 text-white",
  speaker: "bg-blue-600 text-white",
  general: "bg-gray-500 text-white",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getClubEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.description
      ? event.description.slice(0, 160)
      : `${event.title} — Fullerton Rotary Club event`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getClubEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const categoryClass =
    categoryColors[(event.category || "").toLowerCase()] ||
    categoryColors.general;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <section className="bg-navy-700 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-navy-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Event Card */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* Category Badge */}
            {event.category && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4 ${categoryClass}`}
              >
                {event.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-navy-900 mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {/* Date */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <Calendar className="h-5 w-5 text-navy-600 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </div>
                  <div className="text-sm font-semibold text-navy-900">
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>

              {/* Time */}
              {(event.startTime || event.endTime) && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Clock className="h-5 w-5 text-navy-600 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Time
                    </div>
                    <div className="text-sm font-semibold text-navy-900">
                      {event.startTime}
                      {event.endTime ? ` \u2013 ${event.endTime}` : ""}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <MapPin className="h-5 w-5 text-navy-600 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Location
                    </div>
                    <div className="text-sm font-semibold text-navy-900">
                      {event.location}
                    </div>
                  </div>
                </div>
              )}

              {/* Category */}
              {event.category && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Tag className="h-5 w-5 text-navy-600 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Category
                    </div>
                    <div className="text-sm font-semibold text-navy-900 capitalize">
                      {event.category}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="prose prose-gray max-w-none mb-8">
                <h2 className="text-lg font-semibold text-navy-900 mb-3">
                  About This Event
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            )}

            {/* RSVP Button */}
            {event.rsvpUrl && (
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={event.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  RSVP / Register
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </article>

        {/* Bottom nav */}
        <div className="mt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Events
          </Link>
        </div>
      </div>
    </div>
  );
}
