"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wine, Menu, X, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/vendors", label: "Vendors" },
  { href: "/about", label: "About" },
];

export function PublicHeader({ ticketUrl }: { ticketUrl?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-wine-950/95 backdrop-blur-sm border-b border-wine-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Wine className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">Fullerton Uncorked</span>
              <span className="block text-[10px] text-gold-400/80 tracking-widest uppercase -mt-0.5">2026</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-gold-400 bg-wine-800/60"
                    : "text-wine-200 hover:text-white hover:bg-wine-800/40"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            {ticketUrl ? (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-wine-950 text-sm font-bold shadow-lg shadow-gold-500/20 hover:from-gold-400 hover:to-gold-500 transition-all"
              >
                <Ticket className="w-3.5 h-3.5" />
                Buy Tickets
              </a>
            ) : (
              <Link
                href="/vendors"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-wine-950 text-sm font-bold shadow-lg shadow-gold-500/20 hover:from-gold-400 hover:to-gold-500 transition-all"
              >
                Become a Vendor
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-wine-300 hover:text-white hover:bg-wine-800/40 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-wine-800/50 bg-wine-950">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-gold-400 bg-wine-800/60"
                    : "text-wine-200 hover:text-white hover:bg-wine-800/40"
                )}
              >
                {link.label}
              </Link>
            ))}
            {ticketUrl ? (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-wine-950 text-sm font-bold mt-2"
              >
                <Ticket className="w-4 h-4" />
                Buy Tickets
              </a>
            ) : (
              <Link
                href="/vendors"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-wine-950 text-sm font-bold mt-2"
              >
                Become a Vendor
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
