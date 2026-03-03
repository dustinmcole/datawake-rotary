import type { Metadata } from "next";
import { Wine, Camera, ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery | Fullerton Uncorked 2026",
  description:
    "Photos from past Fullerton Uncorked events.",
};

const GALLERY_YEARS = [
  { year: "2023", images: 6 },
  { year: "2022", images: 6 },
  { year: "2019", images: 4 },
];

const COLORS = [
  "bg-wine-900", "bg-wine-800", "bg-wine-700",
  "bg-wine-600", "bg-gold-700", "bg-gold-600",
];

export default function GalleryPage() {
  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Camera className="w-3.5 h-3.5" />
            Past Events
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">Event Gallery</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            A glimpse into the elegance, community, and joy of Fullerton Uncorked.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {GALLERY_YEARS.map(({ year, images }) => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-wine-500" />
                  <h2 className="text-2xl font-bold text-wine-950">Fullerton Uncorked {year}</h2>
                </div>
                <div className="flex-1 h-px bg-wine-100" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: images }).map((_, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/3] ${COLORS[i % COLORS.length]} flex items-center justify-center group hover:scale-[1.02] transition-transform cursor-pointer shadow-md`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/40" />
                    <div className="relative text-center">
                      <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <span className="text-white/40 text-xs font-medium">{year} Photo {i + 1}</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-wine-950/20 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-white border-t border-wine-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Camera className="w-8 h-8 text-wine-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-wine-950 mb-2">Be Part of the Story</h3>
          <p className="text-gray-500 text-sm">
            Photos from Fullerton Uncorked 2026 will appear here after the event. Tag us with <span className="font-semibold text-wine-700">#FullertonUncorked</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
