import type { Metadata } from "next";
import { Wine, Heart, Users, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Fullerton Uncorked 2026",
  description:
    "Learn about Fullerton Uncorked — its history, mission, and the Rotary Club of Fullerton behind it.",
};

const STATS = [
  { value: "10+", label: "Years of Events" },
  { value: "$500K+", label: "Raised for Community" },
  { value: "400+", label: "Guests Each Year" },
  { value: "50+", label: "Wineries & Vendors" },
];

const TIMELINE = [
  { year: "2013", title: "The First Cork is Pulled", desc: "Fullerton Uncorked launches as a small community wine tasting, raising funds for Rotary youth programs." },
  { year: "2016", title: "Moving to the YMCA", desc: "The event grows and finds its home at the Fullerton Family YMCA — perfect for an elegant evening in the heart of the city." },
  { year: "2019", title: "Record Attendance", desc: "Over 500 guests attend, with 60+ vendors and a live auction raising a record amount for local nonprofits." },
  { year: "2022", title: "Post-Pandemic Comeback", desc: "After a two-year hiatus, Fullerton Uncorked returns stronger than ever with renewed community energy." },
  { year: "2026", title: "The Next Chapter", desc: "Join us October 17, 2026 for our most spectacular evening yet." },
];

export default function AboutPage() {
  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Heart className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">About Fullerton Uncorked</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            A beloved Fullerton tradition bringing community, fine wine, and purpose together every fall.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white border-b border-wine-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-wine-100 bg-cream-50 p-6">
                <div className="text-4xl font-bold text-wine-800 mb-1">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wine-100 border border-wine-200 text-wine-700 text-xs font-semibold tracking-widest uppercase mb-5">
                <Wine className="w-3.5 h-3.5" />
                The Mission
              </div>
              <h2 className="text-3xl font-bold text-wine-950 mb-5">Wine That Does Good</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Fullerton Uncorked was born from a simple idea: bring people together over great wine and use that connection to make Fullerton a better place. Every ticket sold, every bottle poured, every bid placed at the auction goes toward Rotary&apos;s mission of service above self.
              </p>
              <p className="text-gray-600 leading-relaxed">
                When you raise a glass at Fullerton Uncorked, you&apos;re raising up your community.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Users, title: "Community First", desc: "Built by Rotarians, for the entire Fullerton community. Everyone is welcome at our table." },
                { icon: Trophy, title: "Local Impact", desc: "Funds raised stay local — supporting schools, nonprofits, and youth programs in Orange County." },
                { icon: Heart, title: "Service Above Self", desc: "The Rotary Club of Fullerton has served the community since 1922. This event is our signature celebration of that legacy." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-wine-100 bg-white p-5 hover:border-wine-300 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-wine-700 to-wine-950 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-wine-950 mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-wine-950 mb-3">Our History</h2>
            <p className="text-gray-500">A decade of pouring purpose into the community.</p>
          </div>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-wine-100" />
            <div className="space-y-8">
              {TIMELINE.map(({ year, title, desc }) => (
                <div key={year} className="relative flex gap-6">
                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-wine-700 to-wine-950 flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-gold-400">{year}</span>
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="font-bold text-wine-950 mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mx-auto mb-5">
            <Wine className="w-7 h-7 text-gold-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">The Rotary Club of Fullerton</h2>
          <p className="text-wine-200 leading-relaxed mb-4 max-w-xl mx-auto">
            Founded in 1922, the Rotary Club of Fullerton is one of Orange County&apos;s oldest and most active community service organizations.
          </p>
          <a
            href="https://rotaryfullerton.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gold-400 text-sm font-semibold hover:text-gold-300"
          >
            Learn more about Rotary Fullerton &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
