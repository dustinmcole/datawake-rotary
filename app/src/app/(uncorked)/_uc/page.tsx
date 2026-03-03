import type { Metadata } from "next";
import Link from "next/link";
import { Wine, Calendar, MapPin, Ticket, ChevronRight, Star, Heart, Music, Utensils } from "lucide-react";
import { getEventConfig } from "@/lib/queries/event-config";
import { getPublicContacts } from "@/lib/queries/contacts";
import type { Contact } from "@/lib/types";

export const metadata: Metadata = {
  title: "Fullerton Uncorked 2026 — Fine Wine, Craft Beer & Culinary Excellence",
  description:
    "Join us October 17, 2026 for Fullerton Uncorked — an elegant evening of wine, craft beer, and culinary excellence benefiting the Rotary Club of Fullerton.",
  openGraph: {
    title: "Fullerton Uncorked 2026",
    description: "An evening of fine wine, craft beer, and culinary excellence benefiting Rotary.",
    url: "https://fullertonuncorked.org",
    siteName: "Fullerton Uncorked",
    type: "website",
  },
};

const HIGHLIGHTS = [
  { icon: Wine, label: "Premium Wines", desc: "Curated selections from California's finest vineyards" },
  { icon: Utensils, label: "Culinary Excellence", desc: "Gourmet bites from top local restaurants & chefs" },
  { icon: Music, label: "Live Entertainment", desc: "Jazz, acoustic performances & silent auction" },
  { icon: Heart, label: "Community Impact", desc: "100% of proceeds benefit local Rotary programs" },
];

export default async function HomePage() {
  let ticketUrl: string | undefined;
  let sponsors: Contact[] = [];

  try {
    const config = await getEventConfig();
    ticketUrl = config.ticketUrlGeneral || undefined;
  } catch { /* DB not configured */ }

  try {
    sponsors = await getPublicContacts(["sponsor"]);
  } catch { /* DB not configured */ }

  const featuredSponsors = sponsors.filter(
    (s) => s.tier === "title" || s.tier === "platinum" || s.tier === "gold"
  );

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-wine-600/25 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-8">
            <Wine className="w-3.5 h-3.5" />
            October 17, 2026
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight leading-none">
            Fullerton<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">Uncorked</span>
          </h1>
          <p className="text-xl sm:text-2xl text-wine-200 mb-4 font-light max-w-2xl mx-auto">
            An elegant evening of fine wine, craft beer &amp; culinary excellence
          </p>
          <div className="flex items-center justify-center gap-2 text-wine-300 text-sm mb-10">
            <MapPin className="w-4 h-4 text-gold-400" />
            Fullerton Family YMCA &middot; Fullerton, CA
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {ticketUrl ? (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-wine-950 font-bold text-lg shadow-2xl hover:from-gold-300 hover:to-gold-500 transition-all hover:-translate-y-0.5"
              >
                <Ticket className="w-5 h-5" />
                Get Tickets
              </a>
            ) : (
              <Link
                href="/tickets"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-wine-950 font-bold text-lg shadow-2xl hover:from-gold-300 hover:to-gold-500 transition-all hover:-translate-y-0.5"
              >
                <Ticket className="w-5 h-5" />
                Get Tickets
              </Link>
            )}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-wine-500/50 text-wine-100 font-semibold text-lg hover:bg-wine-800/40 transition-all"
            >
              Learn More
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-wine-950/80 backdrop-blur-sm border-t border-wine-700/50 py-5">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <span className="text-wine-300 text-sm">
              <span className="text-gold-400 font-bold">Save the Date:</span> Saturday, October 17, 2026 &middot; 6:00 PM &ndash; 10:00 PM
            </span>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wine-100 border border-wine-200 text-wine-700 text-xs font-semibold tracking-widest uppercase mb-4">
              <Star className="w-3.5 h-3.5" />
              The Experience
            </div>
            <h2 className="text-4xl font-bold text-wine-950 mb-3">An Evening to Remember</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Fullerton Uncorked brings together the finest wines, food, and community spirit for a night of celebration.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="group rounded-2xl border border-wine-100 bg-cream-50 p-6 text-center hover:border-wine-300 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wine-700 to-wine-950 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-lg font-bold text-wine-950 mb-2">{label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors preview */}
      {featuredSponsors.length > 0 && (
        <section className="py-16 bg-cream-50 border-t border-wine-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Proudly Supported By</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {featuredSponsors.map((s) => (
                <div key={s.id} className="inline-flex items-center justify-center h-14 min-w-[120px] px-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  {s.logoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.logoUrl} alt={s.name} className="max-h-full max-w-full object-contain" />
                    : <span className="text-sm font-semibold text-gray-700">{s.name}</span>}
                </div>
              ))}
            </div>
            <Link href="/sponsors" className="text-wine-700 text-sm font-semibold hover:text-wine-500 underline underline-offset-2">
              View all sponsors &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join Us?</h2>
          <p className="text-wine-200 text-lg mb-8 max-w-xl mx-auto">
            Tickets sell fast. Secure yours today and join hundreds of wine lovers supporting the Fullerton community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-wine-950 font-bold text-lg shadow-xl hover:from-gold-300 hover:to-gold-500 transition-all"
            >
              <Ticket className="w-5 h-5" />
              Purchase Tickets
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-wine-500/50 text-wine-100 font-semibold text-lg hover:bg-wine-800/40 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
