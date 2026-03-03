import type { Metadata } from "next";
import Link from "next/link";
import {
  Wine,
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  ExternalLink,
  Star,
  Beer,
  UtensilsCrossed,
  Music,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { getPublicContacts } from "@/lib/queries/contacts";
import type { Contact } from "@/lib/types";

export const metadata: Metadata = {
  title: "Fullerton Uncorked",
  description:
    "Fullerton Uncorked is the Rotary Club of Fullerton's annual wine, beer & food tasting fundraiser. October 17, 2026 at the Fullerton Family YMCA.",
  openGraph: {
    title: "Fullerton Uncorked | Fullerton Rotary Club",
    description:
      "Fullerton Uncorked is the Rotary Club of Fullerton's annual wine, beer & food tasting fundraiser. October 17, 2026 at the Fullerton Family YMCA.",
    url: "https://www.fullertonrotary.org/uncorked",
    siteName: "Fullerton Rotary Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fullerton Uncorked | Fullerton Rotary Club",
    description:
      "Fullerton Uncorked is the Rotary Club of Fullerton's annual wine, beer & food tasting fundraiser. October 17, 2026 at the Fullerton Family YMCA.",
  },
};

/* ============================================ */
/* Sponsor tier display config                  */
/* ============================================ */

type TierKey = "title" | "platinum" | "gold" | "silver" | "bronze" | "friend";

const TIER_ORDER: TierKey[] = ["title", "platinum", "gold", "silver", "bronze", "friend"];

const TIER_CONFIG: Record<TierKey, { label: string; logoHeight: string }> = {
  title:    { label: "Title Sponsor",        logoHeight: "h-20" },
  platinum: { label: "Platinum Sponsors",     logoHeight: "h-16" },
  gold:     { label: "Gold Sponsors",         logoHeight: "h-14" },
  silver:   { label: "Silver Sponsors",       logoHeight: "h-12" },
  bronze:   { label: "Bronze Sponsors",       logoHeight: "h-10" },
  friend:   { label: "Friends of the Event",  logoHeight: "h-10" },
};

/* ============================================ */
/* PAGE COMPONENT                               */
/* ============================================ */

export default async function UncorkedLandingPage() {
  let sponsors: Contact[] = [];
  try {
    sponsors = await getPublicContacts(["sponsor", "potential_sponsor"]);
  } catch (error) {
    console.error('Request failed:', error);
    // DB not configured — render static fallback
  }

  const grouped = sponsors.reduce<Partial<Record<TierKey, Contact[]>>>((acc, s) => {
    const tier = (s.tier as TierKey | undefined) ?? "friend";
    if (TIER_ORDER.includes(tier)) (acc[tier] ??= []).push(s);
    return acc;
  }, {});

  const activeTiers = TIER_ORDER.filter((t) => (grouped[t]?.length ?? 0) > 0);
  const hasSponsors = activeTiers.length > 0;

  return (
    <>
      {/* ========================================== */}
      {/* HERO SECTION                               */}
      {/* ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-wine-950">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-wine-600/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-navy-600/40 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-gold-400/8 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-wine-500/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36 lg:py-44 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 border border-gold-500/25 px-5 py-2 text-sm font-semibold text-gold-400 tracking-widest uppercase mb-6">
            <Wine className="h-4 w-4" />
            Annual Fundraiser
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Fullerton Uncorked
          </h1>

          <p className="mt-4 text-xl sm:text-2xl text-wine-200 font-medium">
            Wine, Beer &amp; Food Tasting Fundraiser
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-base text-navy-200">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-gold-400" />
              October 17, 2026
            </span>
            <span className="hidden sm:inline text-navy-500">&middot;</span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-gold-400" />
              5:00 PM &ndash; 9:00 PM
            </span>
            <span className="hidden sm:inline text-navy-500">&middot;</span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-gold-400" />
              Fullerton Family YMCA
            </span>
          </div>

          <div className="mt-10">
            <a
              href="https://www.fullertonuncorked.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
            >
              Visit fullertonuncorked.org
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* ABOUT THE EVENT                            */}
      {/* ========================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
            A Night for Community
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Fullerton Uncorked is an annual evening tasting event featuring fine
            wine, craft beer, and culinary bites from local artisans. Hosted by the
            Rotary Club of Fullerton at the Fullerton Family YMCA, this beloved
            community tradition brings together hundreds of guests for an
            unforgettable night under the lights.
          </p>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            All proceeds benefit the Fullerton Rotary Foundation, supporting local
            nonprofits, youth scholarships, community service projects, and
            humanitarian programs across Orange County and around the world.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* IMPACT STATS                               */}
      {/* ========================================== */}
      <section className="bg-navy-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              Making an Impact
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Through Fullerton Uncorked and the Fullerton Rotary Foundation, our
              club has given back to the community for over 100 years.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <ImpactCard
              icon={<Heart className="h-8 w-8 text-wine-600" />}
              value="$1.3M+"
              label="Total charitable donations"
              accent="wine"
            />
            <ImpactCard
              icon={<Users className="h-8 w-8 text-gold-600" />}
              value="350+"
              label="Guests annually"
              accent="gold"
            />
            <ImpactCard
              icon={<Star className="h-8 w-8 text-navy-600" />}
              value="100+"
              label="Local nonprofits supported"
              accent="navy"
            />
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* WHAT TO EXPECT                             */}
      {/* ========================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              What to Expect
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              An evening of tasting, entertainment, and community — all for a
              great cause.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ExperienceCard
              icon={<Wine className="h-7 w-7" />}
              title="Fine Wine"
              description="Sample curated wines from premier California vineyards and international estates, guided by knowledgeable pourers."
              accent="wine"
            />
            <ExperienceCard
              icon={<Beer className="h-7 w-7" />}
              title="Craft Beer"
              description="Discover local craft breweries and seasonal favorites, from hoppy IPAs to smooth stouts and crisp lagers."
              accent="gold"
            />
            <ExperienceCard
              icon={<UtensilsCrossed className="h-7 w-7" />}
              title="Culinary Bites"
              description="Enjoy artisan food pairings from Fullerton's best restaurants and caterers, featuring seasonal and locally sourced ingredients."
              accent="navy"
            />
            <ExperienceCard
              icon={<Music className="h-7 w-7" />}
              title="Live Entertainment"
              description="Enjoy live music, mingling, and a festive atmosphere in the beautiful outdoor setting of the Fullerton YMCA."
              accent="wine"
            />
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* EVENT DETAILS CARD                         */}
      {/* ========================================== */}
      <section className="bg-navy-50 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-navy-100 overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-navy-700 via-navy-800 to-wine-900 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="h-6 w-6 text-gold-400" />
                Event Details
              </h2>
            </div>

            {/* Card body */}
            <div className="p-8 sm:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <DetailItem
                  icon={<Calendar className="h-5 w-5 text-wine-600" />}
                  label="Date"
                  value="Saturday, October 17, 2026"
                />
                <DetailItem
                  icon={<Clock className="h-5 w-5 text-wine-600" />}
                  label="Time"
                  value="5:00 PM \u2013 9:00 PM"
                />
                <DetailItem
                  icon={<MapPin className="h-5 w-5 text-wine-600" />}
                  label="Venue"
                  value="Fullerton Family YMCA"
                />
                <DetailItem
                  icon={<MapPin className="h-5 w-5 text-wine-600" />}
                  label="Address"
                  value="201 S Basque Ave, Fullerton, CA 92832"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3 bg-wine-50 rounded-xl p-4">
                  <Ticket className="h-5 w-5 text-wine-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-wine-900">
                      Presale Tickets Only
                    </p>
                    <p className="text-sm text-wine-700 mt-1">
                      Tickets must be purchased in advance. There will be no
                      ticket sales at the door. Visit{" "}
                      <a
                        href="https://www.fullertonuncorked.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium hover:text-wine-900 transition-colors"
                      >
                        fullertonuncorked.org
                      </a>{" "}
                      for ticket information when they become available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SPONSOR RECOGNITION                        */}
      {/* ========================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
              Our Sponsors
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Fullerton Uncorked is made possible by the generous support of our
              community partners.
            </p>
          </div>

          {hasSponsors ? (
            <div className="space-y-8">
              {activeTiers.map((tier) => (
                <SponsorTierSection
                  key={tier}
                  tier={tier}
                  sponsors={grouped[tier]!}
                />
              ))}

              <div className="text-center pt-4">
                <Link
                  href="/sponsors"
                  className="inline-flex items-center text-navy-700 font-semibold hover:text-wine-600 transition-colors"
                >
                  View All Sponsors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-wine-50 border border-wine-100 flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-wine-400" />
              </div>
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                Our generous sponsors make Fullerton Uncorked possible. For
                sponsorship opportunities, contact us at{" "}
                <a
                  href="mailto:sponsor@fullertonuncorked.org"
                  className="text-wine-700 font-medium underline hover:text-wine-900 transition-colors"
                >
                  sponsor@fullertonuncorked.org
                </a>
                .
              </p>
              <div className="mt-6">
                <Link
                  href="/sponsors"
                  className="inline-flex items-center text-navy-700 font-semibold hover:text-wine-600 transition-colors"
                >
                  View Sponsor Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* CTA SECTION                                */}
      {/* ========================================== */}
      <section className="bg-gradient-to-br from-navy-700 via-navy-800 to-wine-900">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 border border-gold-500/25 px-4 py-1.5 text-sm font-semibold text-gold-400 tracking-wider uppercase mb-6">
            <Wine className="h-4 w-4" />
            October 17, 2026
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Join Us for Uncorked 2026
          </h2>
          <p className="mt-6 text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Gather your friends, enjoy an evening of exceptional wine, beer, and
            food, and support the programs that make Fullerton a better place to
            live. We hope to see you there.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.fullertonuncorked.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
            >
              Visit fullertonuncorked.org
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Become a Rotary Member
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

function ImpactCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: "wine" | "gold" | "navy";
}) {
  const bgMap = {
    wine: "bg-wine-50",
    gold: "bg-gold-50",
    navy: "bg-navy-100",
  };

  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className={`flex items-center justify-center rounded-full ${bgMap[accent]} p-3`}>
        {icon}
      </div>
      <p className="mt-5 text-4xl font-bold text-navy-800">{value}</p>
      <p className="mt-1 text-gray-500">{label}</p>
    </div>
  );
}

function ExperienceCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "wine" | "gold" | "navy";
}) {
  const styleMap = {
    wine: {
      bg: "bg-wine-50",
      text: "text-wine-700",
      hoverBg: "group-hover:bg-wine-100",
      hoverText: "group-hover:text-wine-800",
      border: "hover:border-wine-200",
    },
    gold: {
      bg: "bg-gold-50",
      text: "text-gold-700",
      hoverBg: "group-hover:bg-gold-100",
      hoverText: "group-hover:text-gold-800",
      border: "hover:border-gold-200",
    },
    navy: {
      bg: "bg-navy-50",
      text: "text-navy-700",
      hoverBg: "group-hover:bg-navy-100",
      hoverText: "group-hover:text-navy-800",
      border: "hover:border-navy-200",
    },
  };

  const s = styleMap[accent];

  return (
    <div className={`group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md ${s.border} transition-all`}>
      <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${s.bg} ${s.text} ${s.hoverBg} ${s.hoverText} transition-colors`}>
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1 text-navy-800 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SponsorTierSection({
  tier,
  sponsors,
}: {
  tier: TierKey;
  sponsors: Contact[];
}) {
  const { label, logoHeight } = TIER_CONFIG[tier];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 sm:p-8">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-5">
        {label}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {sponsors.map((s) => {
          const inner = s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logoUrl}
              alt={s.name}
              className={`max-w-full object-contain ${logoHeight}`}
            />
          ) : (
            <span className="text-sm font-semibold text-gray-800 text-center leading-tight px-3">
              {s.name}
            </span>
          );

          const cls = `inline-flex items-center justify-center ${logoHeight} min-w-[120px] px-4 rounded-xl bg-white border border-gray-200 transition-all`;

          return s.website ? (
            <a
              key={s.id}
              href={s.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cls} hover:border-wine-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              {inner}
            </a>
          ) : (
            <div key={s.id} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
