"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/join", label: "Join" },
  { href: "/contact", label: "Contact" },
];

function RotaryWheel({ className }: { className?: string }) {
  // Pre-computed to avoid server/client floating-point hydration mismatch
  const spokes = [
    { x1: "24", y1: "20", x2: "38", y2: "20" },
    { x1: "22", y1: "23.464", x2: "29", y2: "32.124" },
    { x1: "18", y1: "23.464", x2: "11", y2: "32.124" },
    { x1: "16", y1: "20", x2: "2", y2: "20" },
    { x1: "18", y1: "16.536", x2: "11", y2: "7.876" },
    { x1: "22", y1: "16.536", x2: "29", y2: "7.876" },
  ];
  const dots = [
    { cx: "33.99", cy: "27.5" },
    { cx: "20", cy: "35" },
    { cx: "6.01", cy: "27.5" },
    { cx: "6.01", cy: "12.5" },
    { cx: "20", cy: "5" },
    { cx: "33.99", cy: "12.5" },
  ];
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="4" fill="currentColor" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="currentColor" strokeWidth="1.5" />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="2" fill="currentColor" />
      ))}
    </svg>
  );
}

export function RotaryHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-navy-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 text-gold-500 group-hover:text-gold-600 transition-colors">
              <RotaryWheel className="w-10 h-10" />
            </div>
            <div className="leading-tight">
              <span className="text-navy-700 font-bold text-base tracking-tight block">Fullerton Rotary</span>
              <span className="text-navy-400 text-[11px] tracking-widest uppercase">Est. 1924</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-navy-700 bg-navy-50"
                    : "text-navy-500 hover:text-navy-700 hover:bg-navy-50/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Login + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              Member Login
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-navy-500 hover:text-navy-700 hover:bg-navy-50 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-navy-700 bg-navy-50"
                    : "text-navy-500 hover:text-navy-700 hover:bg-navy-50/60"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-navy-700 text-white text-sm font-bold mt-2"
            >
              <LogIn className="w-4 h-4" />
              Member Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
