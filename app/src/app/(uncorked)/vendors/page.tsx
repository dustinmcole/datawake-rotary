import type { Metadata } from "next";
import Link from "next/link";
import { Wine, Beer, UtensilsCrossed, Music, Package, ExternalLink, Store } from "lucide-react";
import { getPublicContacts } from "@/lib/queries/contacts";
import type { Contact, VendorCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Vendors | Fullerton Uncorked 2026",
  description:
    "Taste your way through Fullerton's finest wine, beer, spirits, and culinary offerings at Fullerton Uncorked — October 17, 2026.",
};

// ── Category config ──────────────────────────────────────────────────────────

type CategoryConfig = {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
};

const CATEGORY_CONFIG: Record<VendorCategory, CategoryConfig> = {
  wine: {
    label: "Wine",
    icon: Wine,
    badgeClass: "bg-wine-100 text-wine-700",
  },
  beer: {
    label: "Craft Beer",
    icon: Beer,
    badgeClass: "bg-amber-100 text-amber-700",
  },
  food: {
    label: "Food & Culinary",
    icon: UtensilsCrossed,
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  entertainment: {
    label: "Entertainment",
    icon: Music,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  services: {
    label: "Services",
    icon: Package,
    badgeClass: "bg-gray-100 text-gray-700",
  },
};

const CATEGORY_ORDER: VendorCategory[] = ["wine", "beer", "food", "entertainment", "services"];

// ── Sub-components ───────────────────────────────────────────────────────────

function VendorCard({ vendor }: { vendor: Contact }) {
  const cat = vendor.vendorCategory;
  const badge = cat ? CATEGORY_CONFIG[cat] : null;

  return (
    <div className="bg-white border border-wine-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-wine-300 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {vendor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.logoUrl}
              alt={`${vendor.name} logo`}
              className="w-10 h-10 rounded-lg object-contain border border-wine-100 shrink-0 bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-wine-50 border border-wine-100 flex items-center justify-center shrink-0">
              <Store className="w-4.5 h-4.5 text-wine-400" />
            </div>
          )}
          <p className="font-semibold text-wine-950 leading-snug">{vendor.name}</p>
        </div>
        {badge && (
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.badgeClass}`}>
            {badge.label}
          </span>
        )}
      </div>

      {vendor.website && (
        <a
          href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-wine-600 hover:text-wine-800 transition-colors font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Visit website
        </a>
      )}
    </div>
  );
}

function CategorySection({
  category,
  vendors,
}: {
  category: VendorCategory;
  vendors: Contact[];
}) {
  const { label, icon: Icon } = CATEGORY_CONFIG[category];
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wine-800 to-wine-950 flex items-center justify-center shadow-md shadow-wine-900/20 shrink-0">
          <Icon className="w-4.5 h-4.5 text-gold-400" />
        </div>
        <h2 className="text-xl font-bold text-wine-950">{label}</h2>
        <span className="text-sm text-wine-400 font-medium">{vendors.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <VendorCard key={v.id} vendor={v} />
        ))}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function VendorsPage() {
  let vendors: Contact[] = [];
  try {
    vendors = await getPublicContacts(["vendor", "potential_vendor"]);
  } catch {
    // DB not configured — render empty state
  }

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<VendorCategory, Contact[]>>(
    (acc, cat) => {
      acc[cat] = vendors.filter((v) => v.vendorCategory === cat);
      return acc;
    },
    { wine: [], beer: [], food: [], entertainment: [], services: [] }
  );

  const activeCategories = CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0);
  const hasVendors = activeCategories.length > 0;

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Wine className="w-3.5 h-3.5" />
            Fullerton Uncorked 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
            Our Vendors
          </h1>
          <p className="text-lg text-wine-200 leading-relaxed max-w-2xl mx-auto">
            Taste your way through Fullerton&apos;s finest wine, beer, spirits, and culinary offerings.
          </p>
        </div>
      </section>

      {/* Vendor grid or empty state */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {hasVendors ? (
          <div className="space-y-14">
            {activeCategories.map((cat) => (
              <CategorySection key={cat} category={cat} vendors={grouped[cat]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-wine-800 to-wine-950 mb-6 shadow-lg shadow-wine-900/20">
              <Wine className="w-7 h-7 text-gold-400" />
            </div>
            <h2 className="text-2xl font-bold text-wine-950 mb-3">Vendor Lineup Coming Soon</h2>
            <p className="text-wine-600 max-w-md mx-auto leading-relaxed mb-8">
              Check back as we confirm participants for Fullerton Uncorked 2026. An exciting
              selection of wineries, breweries, and culinary vendors is being finalized.
            </p>
            <Link
              href="/vendor-interest"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-wine-800 to-wine-600 text-white font-semibold text-sm shadow-md shadow-wine-900/20 hover:from-wine-700 hover:to-wine-500 transition-all"
            >
              Express Interest in Participating
            </Link>
          </div>
        )}
      </section>

      {/* Participate CTA */}
      <section className="bg-wine-950 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-400 text-xs font-bold tracking-widest uppercase mb-3">
            Vendors & Wineries
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">Want to Participate?</h2>
          <p className="text-wine-300 leading-relaxed mb-8 max-w-xl mx-auto">
            Join us for an evening of great pours and even greater company. Share your details
            and our team will be in touch with participation packages.
          </p>
          <Link
            href="/vendor-interest"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-wine-950 font-bold text-sm shadow-lg shadow-gold-500/20 hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            <Store className="w-4 h-4" />
            Vendor Interest Form
          </Link>
        </div>
      </section>
    </div>
  );
}
