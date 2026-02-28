"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// Pre-computed 24-tooth Rotary gear (module scope)
// Deterministic math → same on server + client → no hydration mismatch
// ─────────────────────────────────────────────────────────
const GEAR_PATH = (() => {
  const cx = 50, cy = 50, oR = 47, iR = 38, n = 24;
  const step = (2 * Math.PI) / n;
  const f = (x: number) => x.toFixed(3);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2;
    const v1 = [cx + iR * Math.cos(a), cy + iR * Math.sin(a)];
    const t1 = [cx + oR * Math.cos(a + step * 0.25), cy + oR * Math.sin(a + step * 0.25)];
    const t2 = [cx + oR * Math.cos(a + step * 0.75), cy + oR * Math.sin(a + step * 0.75)];
    const v2 = [cx + iR * Math.cos(a + step), cy + iR * Math.sin(a + step)];
    if (i === 0) d += `M${f(v1[0])},${f(v1[1])}`;
    d += ` L${f(t1[0])},${f(t1[1])} L${f(t2[0])},${f(t2[1])} L${f(v2[0])},${f(v2[1])}`;
  }
  return d + " Z";
})();

const GEAR_SPOKES = (() => {
  const cx = 50, cy = 50, r1 = 9, r2 = 33;
  const f = (x: number) => x.toFixed(3);
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i / 3) * Math.PI - Math.PI / 2;
    return {
      x1: f(cx + r1 * Math.cos(a)),
      y1: f(cy + r1 * Math.sin(a)),
      x2: f(cx + r2 * Math.cos(a)),
      y2: f(cy + r2 * Math.sin(a)),
    };
  });
})();

// ─────────────────────────────────────────────────────────
// Gear component — bgFill controls the "hole" color
// Default white works on the white header
// ─────────────────────────────────────────────────────────
function RotaryGear({ className, bgFill = "white" }: { className?: string; bgFill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 24-tooth cog ring */}
      <path d={GEAR_PATH} fill="currentColor" />
      {/* Inner circle cutout */}
      <circle cx="50" cy="50" r="33" fill={bgFill} />
      {/* 6 spokes */}
      {GEAR_SPOKES.map((s, i) => (
        <line
          key={i}
          x1={s.x1} y1={s.y1}
          x2={s.x2} y2={s.y2}
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      ))}
      {/* Center hub */}
      <circle cx="50" cy="50" r="9.5" fill="currentColor" />
      {/* Hub hole */}
      <circle cx="50" cy="50" r="4.5" fill={bgFill} />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/join", label: "Join" },
  { href: "/contact", label: "Contact" },
];

export function RotaryHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <RotaryGear className="w-10 h-10 text-navy-700 group-hover:text-gold-600 transition-colors" />
            <div className="leading-tight">
              <span className="text-navy-900 font-black text-[15px] tracking-tight block">Fullerton Rotary</span>
              <span className="text-navy-400 text-[10px] tracking-widest uppercase font-medium">Est. 1924 · District 5320</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-navy-900 bg-navy-50 font-semibold"
                    : "text-gray-500 hover:text-navy-800 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Member login + mobile toggle */}
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
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-navy-700 hover:bg-gray-100 transition-colors"
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
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-navy-900 bg-navy-50 font-semibold"
                    : "text-gray-500 hover:text-navy-800 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-navy-700 text-white text-sm font-bold mt-2 hover:bg-navy-800 transition-colors"
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
