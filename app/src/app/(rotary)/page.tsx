import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar, MapPin, Clock, ArrowRight, Award, Heart,
  GraduationCap, Globe, Briefcase, Wine,
} from "lucide-react";
import { getApprovedPublicEvents } from "@/lib/queries/events-club";
import type { ClubEvent } from "@/lib/queries/events-club";
import { formatDate } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// Pre-computed 24-tooth Rotary gear (same on server + client)
// ─────────────────────────────────────────────────────────
const GEAR_PATH = (() => {
  const cx = 50, cy = 50, oR = 47, iR = 38, n = 24;
  const step = (2 * Math.PI) / n;
  const f = (x: number) => x.toFixed(3);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2;
    const v1 = [cx + iR * Math.cos(a), cy + iR * Math.sin(a)];
    const t1 = [cx + oR * Math.cos(a + step * 0.25), cy + oR * Math.sin(a + step * 0.25)];
    const t2 = [cx + oR * Math.cos(a + step * 0.75), cy + oR * Math.sin(a + step * 0.75)];
    const v2 = [cx + iR * Math.cos(a + step), cy + iR * Math.sin(a + step)];
    if (i === 0) d += `M${f(v1[0])},${f(v1[1])}`;
    d += ` L${f(t1[0])},${f(t1[1])} L${f(t2[0])},${f(t2[1])} L${f(v2[0])},${f(v2[1])}`;
  }
  return d + " Z";
})();

const GEAR_SPOKES = (() => {
  const cx = 50, cy = 50, r1 = 9, r2 = 33;
  const f = (x: number) => x.toFixed(3);
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i / 3) * Math.PI - Math.PI / 2;
    return {
      x1: f(cx + r1 * Math.cos(a)), y1: f(cy + r1 * Math.sin(a)),
      x2: f(cx + r2 * Math.cos(a)), y2: f(cy + r2 * Math.sin(a)),
    };
  });
})();

// ─────────────────────────────────────────────────────────
// Nonprofit of the Month — UPDATE THESE WITH REAL DATA
// ─────────────────────────────────────────────────────────
const NONPROFIT_OF_MONTH = {
  name: "Coming soon — check back shortly",
  description:
    "Each month, Fullerton Rotary spotlights a local nonprofit making a meaningful impact in our community. We'll feature their mission, share their story, and encourage our members and friends to get involved.",
  category: "Community Spotlight",
  month: "March 2026",
  link: "",
};

// TODO: Dustin to provide past nonprofit data
const PAST_NONPROFITS: { name: string; month: string }[] = [
  // Example format:
  // { name: "Fullerton Museum Center", month: "Feb 2026" },
];

export const metadata: Metadata = {
  title: "Fullerton Rotary Club — Service Above Self",
  description:
    "The Rotary Club of Fullerton has been serving the community since 1924. Join us every Wednesday at Coyote Hills Country Club.",
};

export default async function HomePage() {
  let events: ClubEvent[] = [];
  try {
    const all = await getApprovedPublicEvents();
    events = all.slice(0, 2); // 2 special events + the static weekly card = 3 total
  } catch {
    events = [];
  }

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ───────────────────────────────────── */}
      <div className="bg-navy-900 py-2.5 px-4 text-center text-sm">
        <span className="font-bold text-gold-400">Weekly Lunch Meeting</span>
        <span className="mx-2 text-navy-500">·</span>
        <span className="text-navy-200">Every Wednesday, 12:00–1:30 PM</span>
        <span className="mx-2 text-navy-500">·</span>
        <span className="text-navy-300 font-medium">Coyote Hills Country Club, Fullerton</span>
      </div>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative bg-navy-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Large decorative gear — right side, stroke only (works on any bg) */}
        <div
          className="absolute -right-24 top-1/2 -translate-y-1/2 w-[560px] h-[560px] pointer-events-none"
          aria-hidden
        >
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d={GEAR_PATH} fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(245,158,11,0.05)" strokeWidth="0.3" />
            {GEAR_SPOKES.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke="rgba(245,158,11,0.06)" strokeWidth="0.5" />
            ))}
            <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="0.4" />
          </svg>
        </div>

        {/* Second gear — small, bottom-left, solid but very faint */}
        <div className="absolute -left-16 -bottom-16 w-64 h-64 pointer-events-none" aria-hidden>
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d={GEAR_PATH} fill="rgba(0,31,61,0.6)" />
          </svg>
        </div>

        {/* Gold accent lines */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gold-500/0 via-gold-500/30 to-gold-500/0" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-44 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="text-gold-300 text-xs font-semibold tracking-widest uppercase">
                Rotary Club of Fullerton · Since 1924
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-6">
              Service<br />
              <span className="text-gold-400">Above Self</span>
            </h1>

            <p className="text-lg sm:text-xl text-navy-200 leading-relaxed mb-10 max-w-xl">
              A community of Fullerton leaders, professionals, and neighbors — united by a
              commitment to making a lasting difference locally and around the world.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-bold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
              >
                Learn About Membership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────── */}
      <section className="bg-navy-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-navy-600">
            {[
              { value: "1924", label: "Year Founded" },
              { value: "$1.3M+", label: "Community Giving" },
              { value: "300+", label: "Members Strong" },
              { value: "Dist. 5320", label: "Rotary International" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-10 px-6">
                <p className="text-3xl sm:text-4xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] font-bold tracking-widest uppercase text-gold-400 mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="text-gold-600 font-bold tracking-widest uppercase text-xs mb-4 block">About Our Club</span>
              <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight leading-tight mb-6">
                Fullerton&rsquo;s Club<br />Since 1924
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-5">
                The Rotary Club of Fullerton is one of the oldest and most active Rotary clubs in
                Southern California. Our members represent a cross-section of Fullerton&rsquo;s
                business, civic, and community leaders.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                As part of Rotary International District 5320, we gather every Wednesday for
                fellowship, great speakers, and to take action on the issues that matter most —
                in our community and around the world.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-navy-700 font-bold hover:text-gold-600 transition-colors"
              >
                Our story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Visual — swap with <Image> once club photos are available */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-navy-900 overflow-hidden flex items-center justify-center">
                {/* Photo placeholder with decorative gear */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
                  <div className="relative z-10 text-center p-8">
                    <div className="w-28 h-28 mx-auto mb-4 text-gold-400/30">
                      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <path d={GEAR_PATH} fill="currentColor" />
                        <circle cx="50" cy="50" r="33" fill="#001f3d" />
                        {GEAR_SPOKES.map((s, i) => (
                          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                            stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
                        ))}
                        <circle cx="50" cy="50" r="9.5" fill="currentColor" />
                        <circle cx="50" cy="50" r="4.5" fill="#001f3d" />
                      </svg>
                    </div>
                    <p className="text-navy-500 text-sm font-medium">Club photo coming soon</p>
                  </div>
                </div>
              </div>
              {/* Gold accent block */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-400 rounded-xl -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-navy-100 rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── NONPROFIT OF THE MONTH ──────────────────────────────── */}
      <section className="bg-cream-100 border-y border-cream-200 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Featured nonprofit */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-8 bg-gold-500" />
                <span className="text-gold-600 font-bold tracking-widest uppercase text-xs">
                  {NONPROFIT_OF_MONTH.month}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight mb-6">
                Nonprofit of the Month
              </h2>

              <div className="bg-white rounded-2xl border-2 border-gold-300 p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 bg-gold-50 rounded-full px-3 py-1 text-xs font-bold text-gold-700 mb-5">
                  <Award className="h-3.5 w-3.5" />
                  {NONPROFIT_OF_MONTH.category}
                </div>
                <h3 className="text-2xl font-black text-navy-900 mb-3">{NONPROFIT_OF_MONTH.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{NONPROFIT_OF_MONTH.description}</p>
                {NONPROFIT_OF_MONTH.link && (
                  <Link
                    href={NONPROFIT_OF_MONTH.link}
                    className="inline-flex items-center gap-2 text-navy-700 font-bold hover:text-gold-600 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Past nonprofits */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">
                Past Selections
              </h4>
              {PAST_NONPROFITS.length > 0 ? (
                <ul className="space-y-0">
                  {PAST_NONPROFITS.map((np) => (
                    <li
                      key={np.month}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-semibold text-navy-800">{np.name}</span>
                      <span className="text-xs text-gray-400 font-medium ml-4 shrink-0">{np.month}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-200">
                  <Heart className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Past selections coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="text-gold-600 font-bold tracking-widest uppercase text-xs mb-2 block">Get Involved</span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">Upcoming Events</h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-700 hover:text-gold-600 transition-colors"
            >
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Static weekly meeting card — always visible */}
            <div className="flex flex-col rounded-2xl border-2 border-navy-100 bg-navy-50 overflow-hidden">
              <div className="h-1.5 bg-navy-700" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-navy-700 px-3 py-1 text-[11px] font-bold text-white mb-4">
                  <Clock className="h-3 w-3" />
                  Every Wednesday
                </div>
                <h3 className="text-lg font-black text-navy-900 mb-3">Wednesday Lunch Meeting</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                    <span>12:00 PM – 1:30 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                    <span>Coyote Hills Country Club</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-navy-400 shrink-0 mt-0.5 opacity-0" />
                    <span className="text-gray-400">1440 E Bastanchury Rd, Fullerton</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                  Guest speakers, fellowship, and Rotary updates. Guests are always welcome.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex items-center text-sm font-bold text-navy-700 hover:text-gold-600 transition-colors"
                >
                  Plan your visit
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* DB events */}
            {events.length > 0
              ? events.map((event) => <EventCard key={event.id} event={event} />)
              : (
                <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-gray-200 p-10 flex items-center justify-center text-center">
                  <div>
                    <Calendar className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">Special events added regularly — check back soon.</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ───────────────────────────────────────────── */}
      <section className="bg-navy-900 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <span className="text-gold-400 font-bold tracking-widest uppercase text-xs mb-3 block">How We Serve</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Making a Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ProgramCard
              icon={<Heart className="h-6 w-6" />}
              title="Community Service"
              description="Hands-on projects supporting local nonprofits, park cleanups, food drives, and community outreach."
            />
            <ProgramCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Youth Programs"
              description="Scholarships, Interact Clubs, RYLA leadership retreats, and mentorship for Fullerton students."
            />
            <ProgramCard
              icon={<Globe className="h-6 w-6" />}
              title="International Service"
              description="Partnering with Rotary International on global initiatives — clean water, healthcare, and education."
            />
            <ProgramCard
              icon={<Briefcase className="h-6 w-6" />}
              title="Vocational Service"
              description="Ethical business practices, professional networking, and community impact through member expertise."
            />
          </div>
          <div className="text-center mt-12">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-bold transition-colors"
            >
              Explore all programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── UNCORKED CALLOUT ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-wine-950">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-wine-950 via-wine-900/90 to-navy-900/80" />
        {/* Decorative gear */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 pointer-events-none opacity-10" aria-hidden>
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d={GEAR_PATH} fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-20">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/30 px-4 py-1.5 text-sm font-bold text-gold-300 mb-6">
                <Wine className="h-4 w-4" />
                Annual Fundraiser · October 17, 2026
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Fullerton<br />
                <span className="text-gold-400">Uncorked</span>
              </h2>
              <p className="text-lg text-wine-200 leading-relaxed mb-3 max-w-lg">
                Wine, beer, and food tasting — an unforgettable evening benefiting local nonprofits and community programs.
              </p>
              <p className="text-gold-300 font-bold mb-8">
                5:00–9:00 PM · Fullerton Family YMCA
              </p>
              <Link
                href="/uncorked"
                className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-bold text-navy-900 hover:bg-gold-400 transition-colors shadow-lg"
              >
                Learn More & Get Tickets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            {/* Event detail card */}
            <div className="shrink-0 w-full lg:w-72 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">Event Details</p>
              <ul className="space-y-3 text-sm text-wine-100">
                <li className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>Saturday, October 17, 2026</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>5:00 PM – 9:00 PM</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>Fullerton Family YMCA</span>
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-wine-300">
                  All proceeds benefit local nonprofits through the Fullerton Rotary Foundation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ───────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="bg-navy-900 rounded-3xl p-10 sm:p-16 text-center overflow-hidden relative">
            {/* Background gear decoration */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 pointer-events-none" aria-hidden>
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path d={GEAR_PATH} fill="rgba(0,51,102,0.8)" />
              </svg>
            </div>
            <div className="relative z-10">
              <blockquote className="mb-8">
                <p className="text-navy-300 text-base sm:text-lg italic leading-relaxed max-w-2xl mx-auto">
                  &ldquo;Is it the truth? Is it fair to all concerned? Will it build goodwill and
                  better friendships? Will it be beneficial to all concerned?&rdquo;
                </p>
                <footer className="mt-3">
                  <cite className="text-gold-400 font-bold text-sm not-italic">— The Four-Way Test</cite>
                </footer>
              </blockquote>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-navy-300 text-lg mb-10 max-w-xl mx-auto">
                Join the Rotary Club of Fullerton. Whether you&rsquo;re a lifelong resident or
                new to the area, there&rsquo;s a place for you at our table.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-10 py-4 text-base font-bold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
              >
                Become a Member
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bar: string; badge: string }> = {
  meeting:     { bar: "bg-navy-700",    badge: "bg-navy-700 text-white" },
  service:     { bar: "bg-green-700",   badge: "bg-green-700 text-white" },
  social:      { bar: "bg-purple-600",  badge: "bg-purple-600 text-white" },
  fundraiser:  { bar: "bg-wine-700",    badge: "bg-wine-700 text-white" },
  speaker:     { bar: "bg-blue-700",    badge: "bg-blue-700 text-white" },
  general:     { bar: "bg-gray-500",    badge: "bg-gray-500 text-white" },
};

function EventCard({ event }: { event: ClubEvent }) {
  const colors = CATEGORY_COLORS[event.category ?? "general"] ?? CATEGORY_COLORS.general;
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className={`h-1.5 w-full ${colors.bar}`} />
      <div className="p-6 flex-1 flex flex-col">
        <div className={`inline-flex self-start items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize mb-3 ${colors.badge}`}>
          {event.category}
        </div>
        <h3 className="text-lg font-black text-navy-900 leading-snug mb-3 group-hover:text-navy-700 transition-colors">
          {event.title}
        </h3>
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-gray-400 line-clamp-2 flex-1">{event.description}</p>
        )}
        <Link
          href={`/events/${event.slug ?? event.id}`}
          className="mt-5 inline-flex items-center text-sm font-bold text-navy-700 hover:text-gold-600 transition-colors"
        >
          Learn more
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ProgramCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-navy-800/40 border border-navy-700/60 p-7 hover:bg-navy-800 hover:border-gold-500/40 transition-all group">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white mb-2">{title}</h3>
      <p className="text-sm text-navy-300 leading-relaxed">{description}</p>
    </div>
  );
}
