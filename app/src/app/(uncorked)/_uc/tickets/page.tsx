import type { Metadata } from "next";
import { Wine, Ticket, Star, CheckCircle, ExternalLink } from "lucide-react";
import { getEventConfig } from "@/lib/queries/event-config";
import type { EventConfig } from "@/lib/queries/event-config";

export const metadata: Metadata = {
  title: "Tickets | Fullerton Uncorked 2026",
  description:
    "Purchase tickets for Fullerton Uncorked 2026 — General Admission, VIP, and Designated Driver options available.",
};

type TierDef = {
  name: string;
  price: string;
  badge: string | null;
  color: string;
  btnColor: string;
  includes: string[];
  urlKey: keyof EventConfig | null;
};

const TIERS: TierDef[] = [
  {
    name: "Designated Driver",
    price: "$20",
    badge: null,
    color: "border-gray-200 bg-white",
    btnColor: "bg-gray-800 hover:bg-gray-700 text-white",
    includes: [
      "Event admission",
      "Non-alcoholic beverages",
      "Food sampling",
      "Access to silent auction & raffle",
    ],
    urlKey: null,
  },
  {
    name: "General Admission",
    price: "$75",
    badge: "Most Popular",
    color: "border-wine-300 bg-white",
    btnColor: "bg-gradient-to-r from-wine-700 to-wine-900 hover:from-wine-600 hover:to-wine-800 text-white",
    includes: [
      "Tasting glass",
      "Unlimited wine & beer tastings",
      "Gourmet food sampling",
      "Live entertainment",
      "Silent auction & raffle access",
    ],
    urlKey: "ticketUrlGeneral",
  },
  {
    name: "VIP",
    price: "$125",
    badge: "Best Experience",
    color: "border-gold-400 bg-gradient-to-b from-gold-50 to-white shadow-xl shadow-gold-900/10",
    btnColor: "bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-wine-950",
    includes: [
      "Early entry at 5:30 PM",
      "Welcome glass of premium wine",
      "Tasting glass",
      "Unlimited wine & beer tastings",
      "Gourmet food sampling",
      "Live entertainment",
      "Priority auction bidding",
      "Exclusive VIP lounge access",
    ],
    urlKey: "ticketUrlVip",
  },
];

export default async function TicketsPage() {
  let config: EventConfig | null = null;
  try {
    config = await getEventConfig();
  } catch { /* DB not configured */ }

  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Ticket className="w-3.5 h-3.5" />
            Secure Your Spot
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">Tickets</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            Choose your experience for Fullerton Uncorked 2026 &mdash; Saturday, October 17.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {TIERS.map(({ name, price, badge, color, btnColor, includes, urlKey }) => {
              const url = urlKey && config ? (config[urlKey] as string | undefined) : undefined;
              return (
                <div key={name} className={`relative rounded-2xl border-2 p-8 flex flex-col ${color}`}>
                  {badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${badge === "Best Experience" ? "bg-gradient-to-r from-gold-400 to-gold-600 text-wine-950" : "bg-wine-800 text-white"}`}>
                      {badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {badge === "Best Experience" && <Star className="w-4 h-4 text-gold-500" />}
                      <h2 className="text-xl font-bold text-wine-950">{name}</h2>
                    </div>
                    <div className="text-4xl font-bold text-wine-800 mt-2">{price}</div>
                    <div className="text-xs text-gray-400 mt-1">per person</div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-wine-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {urlKey === null ? (
                    <a
                      href="/contact"
                      className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${btnColor}`}
                    >
                      <Ticket className="w-4 h-4" />
                      Inquire for DD Tickets
                    </a>
                  ) : url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${btnColor}`}
                    >
                      <Ticket className="w-4 h-4" />
                      Buy {name} Tickets
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  ) : (
                    <div className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm opacity-60 cursor-not-allowed ${btnColor}`}>
                      <Ticket className="w-4 h-4" />
                      Coming Soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Wine className="w-8 h-8 text-wine-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-wine-950 mb-2">Questions About Tickets?</h3>
          <p className="text-gray-500 text-sm mb-4">
            All ticket sales are final. Event is 21+ for alcohol consumption. Valid government-issued ID required at the door.
          </p>
          <a href="/contact" className="text-wine-700 text-sm font-semibold hover:text-wine-500 underline underline-offset-2">
            Contact us with questions &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
