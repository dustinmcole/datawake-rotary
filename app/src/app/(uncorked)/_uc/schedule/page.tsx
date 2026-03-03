import type { Metadata } from "next";
import { Clock, Wine, Music, Gavel, Ticket } from "lucide-react";

export const metadata: Metadata = {
  title: "Schedule | Fullerton Uncorked 2026",
  description:
    "View the full schedule for Fullerton Uncorked 2026 — Saturday, October 17 at the Fullerton Family YMCA.",
};

const SCHEDULE = [
  { time: "5:30 PM", title: "VIP Early Entry", desc: "VIP ticket holders get early access, a welcome glass of wine, and first choice at the silent auction.", icon: Ticket, highlight: true },
  { time: "6:00 PM", title: "General Admission Opens", desc: "Doors open for all guests. Pick up your tasting glass and start exploring the wine and beer vendors.", icon: Wine, highlight: false },
  { time: "6:00–9:00 PM", title: "Wine & Beer Tastings", desc: "Sample from 30+ wineries and craft breweries. Stroll through vendor booths and enjoy gourmet bites.", icon: Wine, highlight: false },
  { time: "6:30 PM", title: "Live Entertainment Begins", desc: "Enjoy live jazz and acoustic performances throughout the evening.", icon: Music, highlight: false },
  { time: "7:00 PM", title: "Silent Auction Opens", desc: "Bid on exclusive wine packages, getaways, restaurant experiences, and more.", icon: Gavel, highlight: false },
  { time: "8:30 PM", title: "Last Call for Auction Bids", desc: "Final opportunity to place bids on your favorite auction items before they close.", icon: Gavel, highlight: false },
  { time: "8:45 PM", title: "Raffle Drawing", desc: "Raffle tickets available throughout the evening. Must be present to win some prizes.", icon: Ticket, highlight: false },
  { time: "9:00 PM", title: "Silent Auction Closes", desc: "Winning bidders notified and items claimed.", icon: Gavel, highlight: false },
  { time: "9:30 PM", title: "Last Pour", desc: "Final wine and beer pours of the evening.", icon: Wine, highlight: false },
  { time: "10:00 PM", title: "Event Concludes", desc: "Safe travels home — thank you for supporting Rotary Fullerton!", icon: Clock, highlight: false },
];

export default function SchedulePage() {
  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Clock className="w-3.5 h-3.5" />
            October 17, 2026
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">Event Schedule</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            An evening carefully crafted for great wine, great food, and great company.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-wine-100 sm:left-6" />
            <div className="space-y-6">
              {SCHEDULE.map(({ time, title, desc, icon: Icon, highlight }) => (
                <div key={time} className="relative flex gap-5 sm:gap-6">
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg ${highlight ? "bg-gradient-to-br from-gold-400 to-gold-600" : "bg-gradient-to-br from-wine-700 to-wine-950"}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${highlight ? "text-wine-950" : "text-gold-400"}`} />
                  </div>
                  <div className={`flex-1 rounded-2xl border p-5 transition-all ${highlight ? "border-gold-300 bg-gradient-to-r from-gold-50 to-cream-50 shadow-md" : "border-wine-100 bg-white hover:border-wine-200"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className={`font-bold text-base ${highlight ? "text-wine-950" : "text-wine-900"}`}>{title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${highlight ? "bg-gold-200 text-gold-800" : "bg-wine-100 text-wine-700"}`}>{time}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-wine-50 border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-wine-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-wine-900">Schedule subject to change.</span> Final timings will be confirmed closer to the event.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
