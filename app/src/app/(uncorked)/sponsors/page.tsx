import type { Metadata } from "next";
import { Heart, Mail, Wine } from "lucide-react";
import { getPublicContacts } from "@/lib/queries/contacts";
import type { Contact } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sponsors | Fullerton Uncorked 2026",
  description:
    "Fullerton Uncorked is made possible by the generous support of our community partners.",
};

type TierKey = "presenting" | "gold" | "silver" | "bronze" | "friend";

const TIER_ORDER: TierKey[] = ["presenting", "gold", "silver", "bronze", "friend"];

const TIERS: Record<TierKey, { label: string; height: string; text: string; bg: string }> = {
  presenting: { label: "Presenting Sponsor",    height: "h-24", text: "text-lg font-bold",     bg: "border-gold-400 bg-gradient-to-r from-gold-50 to-cream-50" },
  gold:       { label: "Gold Sponsors",          height: "h-16", text: "text-base font-semibold", bg: "border-gold-300 bg-gold-50/60" },
  silver:     { label: "Silver Sponsors",        height: "h-14", text: "text-sm font-semibold",  bg: "border-gray-300 bg-gray-50/60" },
  bronze:     { label: "Bronze Sponsors",        height: "h-12", text: "text-sm font-medium",    bg: "border-amber-300 bg-amber-50/60" },
  friend:     { label: "Friends of the Event",   height: "h-10", text: "text-sm font-medium",    bg: "border-wine-200 bg-wine-50/40" },
};

function SponsorTile({ sponsor, tier }: { sponsor: Contact; tier: TierKey }) {
  const { height, text } = TIERS[tier];
  const inner = sponsor.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
  ) : (
    <span className={`${text} text-gray-800 text-center leading-tight px-3`}>{sponsor.name}</span>
  );
  const cls = `inline-flex items-center justify-center ${height} min-w-[120px] px-4 rounded-xl bg-white border border-gray-200 transition-all`;
  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
       className={`${cls} hover:border-wine-300 hover:shadow-md hover:-translate-y-0.5`}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function TierSection({ tier, sponsors }: { tier: TierKey; sponsors: Contact[] }) {
  const { label, bg } = TIERS[tier];
  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${bg}`}>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-5">{label}</h3>
      <div className="flex flex-wrap items-center gap-3">
        {sponsors.map((s) => <SponsorTile key={s.id} sponsor={s} tier={tier} />)}
      </div>
    </div>
  );
}

export default async function SponsorsPage() {
  let sponsors: Contact[] = [];
  try {
    sponsors = await getPublicContacts(["sponsor", "potential_sponsor"]);
  } catch {
    // DB not configured — show empty state
  }

  const grouped = sponsors.reduce<Partial<Record<TierKey, Contact[]>>>((acc, s) => {
    const tier = (s.tier as TierKey | undefined) ?? "friend";
    if (TIER_ORDER.includes(tier)) (acc[tier] ??= []).push(s);
    return acc;
  }, {});

  const activeTiers = TIER_ORDER.filter((t) => (grouped[t]?.length ?? 0) > 0);

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Wine className="w-3.5 h-3.5" />
            Fullerton Uncorked 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Our Sponsors</h1>
          <p className="text-lg text-wine-200 leading-relaxed max-w-2xl mx-auto">
            Fullerton Uncorked is made possible by the generous support of our community partners.
            Thank you for helping us give back to Fullerton.
          </p>
        </div>
      </section>

      {/* Sponsor tiers */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTiers.length > 0 ? (
            <div className="space-y-6">
              {activeTiers.map((tier) => (
                <TierSection key={tier} tier={tier} sponsors={grouped[tier]!} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-wine-100 border border-wine-200 flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-wine-400" />
              </div>
              <h2 className="text-2xl font-bold text-wine-950 mb-3">Sponsor information coming soon</h2>
              <p className="text-gray-500 text-base max-w-md mx-auto">
                We&apos;re finalizing our 2026 sponsor list. Check back soon to see the businesses
                supporting this year&apos;s event.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sponsor CTA */}
      <section className="py-16 bg-white border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wine-700 to-wine-950 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-wine-900/20">
            <Heart className="w-6 h-6 text-gold-400" />
          </div>
          <h2 className="text-3xl font-bold text-wine-950 mb-3">Interested in Becoming a Sponsor?</h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto mb-3">
            Sponsoring Fullerton Uncorked is a meaningful way to invest in the Fullerton community.
            All proceeds benefit the Fullerton Rotary Foundation, supporting local nonprofits,
            youth programs, and community initiatives across Orange County.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Sponsorships start at the Friend level and offer increased visibility at every tier —
            from logo placement and signage to featured recognition at the event.
          </p>
          <a
            href="mailto:sponsor@fullertonuncorked.org"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-900 text-white font-bold text-base shadow-lg shadow-wine-900/20 hover:from-wine-600 hover:to-wine-800 transition-all"
          >
            <Mail className="w-5 h-5" />
            sponsor@fullertonuncorked.org
          </a>
        </div>
      </section>
    </div>
  );
}
