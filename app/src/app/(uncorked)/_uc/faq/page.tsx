import type { Metadata } from "next";
import { Wine, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | Fullerton Uncorked 2026",
  description:
    "Frequently asked questions about Fullerton Uncorked 2026 — parking, age requirements, rain policy, refunds, and more.",
};

const FAQS = [
  {
    category: "General",
    items: [
      { q: "What is Fullerton Uncorked?", a: "Fullerton Uncorked is an annual wine and beer tasting event benefiting the Rotary Club of Fullerton Foundation. Guests enjoy premium wines, craft beers, gourmet food, live entertainment, and a silent auction — all in support of local community programs." },
      { q: "When and where is the 2026 event?", a: "Saturday, October 17, 2026 at the Fullerton Family YMCA, 400 W. Commonwealth Ave, Fullerton, CA 92832. Doors open at 6:00 PM (VIP at 5:30 PM)." },
      { q: "Is this event 21+?", a: "Yes. Fullerton Uncorked is a 21+ event. Valid government-issued photo ID is required at check-in for all guests. No exceptions." },
    ],
  },
  {
    category: "Tickets",
    items: [
      { q: "How do I purchase tickets?", a: "Tickets are available online through our ticketing partner. Visit our Tickets page to purchase General Admission, VIP, or Designated Driver tickets." },
      { q: "What is the refund policy?", a: "All ticket sales are final and non-refundable. However, tickets may be transferred to another person. Please contact us at info@fullertonuncorked.org if you need to transfer your ticket." },
      { q: "What is included with my ticket?", a: "General Admission includes a tasting glass and unlimited wine and beer tastings throughout the evening. VIP includes early entry at 5:30 PM, a welcome glass, and access to the VIP lounge. Designated Driver tickets include admission and non-alcoholic beverages." },
    ],
  },
  {
    category: "Parking & Getting Here",
    items: [
      { q: "Where should I park?", a: "Free parking is available in the YMCA parking lot and on adjacent streets. We encourage carpooling or rideshare services. Please plan ahead — parking fills quickly." },
      { q: "Is the venue accessible?", a: "Yes, the Fullerton Family YMCA is fully ADA accessible. If you have specific accessibility needs, please contact us in advance at info@fullertonuncorked.org." },
    ],
  },
  {
    category: "Rain & Event Policy",
    items: [
      { q: "What happens if it rains?", a: "Fullerton Uncorked is held rain or shine. The event takes place in covered and indoor spaces at the YMCA. In the unlikely event of cancellation due to severe weather, ticket holders will be notified and refunds processed." },
      { q: "Can I bring outside food or beverages?", a: "Outside food and beverages are not permitted. The event features a wide selection of wines, craft beers, and food sampling from our vendors." },
      { q: "Is the event pet-friendly?", a: "Only ADA-certified service animals are permitted at the event." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <HelpCircle className="w-3.5 h-3.5" />
            Need Help?
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">FAQ</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know before you arrive.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {FAQS.map(({ category, items }) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wine-700 to-wine-950 flex items-center justify-center">
                  <Wine className="w-4 h-4 text-gold-400" />
                </div>
                <h2 className="text-xl font-bold text-wine-950">{category}</h2>
              </div>
              <div className="space-y-4">
                {items.map(({ q, a }) => (
                  <div key={q} className="rounded-2xl border border-wine-100 bg-white p-6 hover:border-wine-200 transition-all">
                    <h3 className="font-bold text-wine-900 mb-3">{q}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-white border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-8 h-8 text-wine-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-wine-950 mb-2">Still Have Questions?</h3>
          <p className="text-gray-500 text-sm mb-4">
            We&apos;re happy to help. Reach out and we&apos;ll get back to you promptly.
          </p>
          <a href="/contact" className="text-wine-700 text-sm font-semibold hover:text-wine-500 underline underline-offset-2">
            Contact us &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
