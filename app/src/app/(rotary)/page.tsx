import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  GraduationCap,
  Globe,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Users,
  Award,
  Wine,
} from "lucide-react";
import { getApprovedPublicEvents } from "@/lib/queries/events-club";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fullerton Rotary Club — Service Above Self",
  description:
    "The Rotary Club of Fullerton has been serving the community since 1924. Learn about our programs, events, and how to get involved.",
};

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof getApprovedPublicEvents>> = [];
  try {
    const allEvents = await getApprovedPublicEvents();
    events = allEvents.slice(0, 3);
  } catch {
    events = [];
  }

  return (
    <>
      {/* ========================================== */}
      {/* HERO SECTION */}
      {/* ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-navy-600/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gold-400/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36 lg:py-44 text-center">
          <p className="text-gold-400 font-semibold tracking-widest uppercase text-sm mb-4">
            Rotary Club of Fullerton
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Service Above Self
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Serving the Fullerton community since 1924. We are a diverse group
            of leaders, professionals, and neighbors united by a commitment to
            making a lasting difference — locally and around the world.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
            >
              Join Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* ABOUT SNIPPET */}
      {/* ========================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              Who We Are
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              The Rotary Club of Fullerton is one of the oldest and most active
              Rotary clubs in Southern California. Established in 1924, our
              members represent a cross-section of Fullerton&apos;s business,
              civic, and community leaders. As part of Rotary International
              District 5320, we meet weekly to build friendships, exchange ideas,
              and take action on the issues that matter most in our community and
              beyond.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatCard
              icon={<Award className="h-8 w-8 text-gold-500" />}
              value="100+ Years"
              label="of service to Fullerton"
            />
            <StatCard
              icon={<Heart className="h-8 w-8 text-gold-500" />}
              value="$1.3M+"
              label="in charitable donations"
            />
            <StatCard
              icon={<Users className="h-8 w-8 text-gold-500" />}
              value="300+"
              label="members strong"
            />
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* UPCOMING EVENTS */}
      {/* ========================================== */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              Upcoming Events
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join us at an upcoming meeting, service project, or social event.
            </p>
          </div>

          {events.length > 0 ? (
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="mt-14 text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">
                Check back soon for upcoming events.
              </p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="inline-flex items-center text-navy-700 font-semibold hover:text-gold-600 transition-colors"
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* PROGRAMS OVERVIEW */}
      {/* ========================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              Making a Difference
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our programs address the most pressing needs in our community and
              around the world.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProgramCard
              icon={<Heart className="h-7 w-7" />}
              title="Community Service"
              description="Hands-on projects that address local needs — from park cleanups to food drives and supporting Fullerton nonprofits."
            />
            <ProgramCard
              icon={<GraduationCap className="h-7 w-7" />}
              title="Youth Programs"
              description="Investing in the next generation through scholarships, Interact Clubs, RYLA, and mentorship for local students."
            />
            <ProgramCard
              icon={<Globe className="h-7 w-7" />}
              title="International Service"
              description="Working with Rotary International to bring clean water, healthcare, and education to communities worldwide."
            />
            <ProgramCard
              icon={<Briefcase className="h-7 w-7" />}
              title="Vocational Service"
              description="Promoting ethical business practices and connecting professionals to serve their communities through their expertise."
            />
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* UNCORKED CALLOUT */}
      {/* ========================================== */}
      <section className="bg-gold-50 border-t-4 border-gold-400">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-1.5 text-sm font-semibold text-gold-700 mb-4">
                <Wine className="h-4 w-4" />
                Annual Fundraiser
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
                Fullerton Uncorked
              </h2>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed max-w-xl">
                Our signature wine, beer, and food tasting event brings
                together the Fullerton community for an unforgettable evening.
                All proceeds benefit local nonprofits and community programs.
              </p>
              <p className="mt-3 font-semibold text-navy-700">
                October 17, 2026 &middot; 5:00 &ndash; 9:00 PM &middot; Fullerton YMCA
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/uncorked"
                className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* JOIN CTA */}
      {/* ========================================== */}
      <section className="bg-navy-700">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="mt-6 text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Whether you are a lifelong Fullerton resident or new to the area,
            there is a place for you at our table. Join the Rotary Club of
            Fullerton and become part of a global network of people of action.
          </p>
          <div className="mt-10">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
            >
              Become a Member
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================ */
/* SUB-COMPONENTS                               */
/* ============================================ */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-center rounded-full bg-gold-50 p-3">
        {icon}
      </div>
      <p className="mt-5 text-3xl font-bold text-navy-800">{value}</p>
      <p className="mt-1 text-gray-500">{label}</p>
    </div>
  );
}

function EventCard({
  event,
}: {
  event: Awaited<ReturnType<typeof getApprovedPublicEvents>>[number];
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6 flex-1 flex flex-col">
        <div className="inline-flex self-start items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700 capitalize mb-3">
          {event.category}
        </div>
        <h3 className="text-xl font-semibold text-navy-800 leading-snug">
          {event.title}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          {(event.startTime || event.endTime) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>
                {event.startTime}
                {event.endTime ? ` \u2013 ${event.endTime}` : ""}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-gray-500 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={`/events/${event.slug ?? event.id}`}
            className="inline-flex items-center text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
          >
            Learn More
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProgramCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md hover:border-gold-200 transition-all">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-navy-50 text-navy-700 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
