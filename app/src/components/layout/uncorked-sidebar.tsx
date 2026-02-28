"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Wine,
  LayoutDashboard,
  FileText,
  CheckSquare,
  DollarSign,
  Star,
  Store,
  UsersRound,
  Inbox,
  Menu,
  X,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/uncorked-hub", label: "Dashboard", icon: LayoutDashboard },
  { href: "/uncorked-hub/meetings", label: "Meeting Notes", icon: FileText },
  { href: "/uncorked-hub/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/uncorked-hub/budget", label: "Budget", icon: DollarSign },
  { href: "/uncorked-hub/sponsors", label: "Sponsors", icon: Star },
  { href: "/uncorked-hub/vendors", label: "Vendors", icon: Store },
  { href: "/uncorked-hub/committee", label: "Committee", icon: UsersRound },
  { href: "/uncorked-hub/vendor-interest", label: "Vendor Interest", icon: Inbox },
  { href: "/uncorked-hub/bryn", label: "Ask Bryn", icon: MessageSquare },
];

export function UncorkedSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-wine-950 text-white flex items-center px-4 z-50 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-wine-800 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Wine className="w-5 h-5 text-gold-400" />
        <span className="font-bold text-sm">Uncorked Planning Hub</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 w-[var(--sidebar-width)] bg-wine-950 text-white flex flex-col z-50 transition-transform duration-200",
          "lg:left-0 lg:translate-x-0",
          open ? "left-0 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 pb-2">
          <Link href="/uncorked-hub" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-shadow">
              <Wine className="w-5 h-5 text-wine-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">Uncorked</h1>
              <p className="text-[11px] text-wine-300 tracking-widest uppercase">Planning Hub</p>
            </div>
          </Link>
        </div>

        {/* Event date badge */}
        <div className="mx-4 mt-4 mb-6 px-3 py-2 rounded-lg bg-wine-900/60 border border-wine-800/50">
          <p className="text-[10px] uppercase tracking-wider text-wine-400 mb-0.5">Event Date</p>
          <p className="text-sm font-semibold text-gold-400">October 17, 2026</p>
          <p className="text-[11px] text-wine-300">5:00 PM — Fullerton YMCA</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/uncorked-hub" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-wine-700/80 to-wine-800/60 text-white shadow-lg shadow-wine-900/30 border border-wine-600/30"
                    : "text-wine-200 hover:bg-wine-900/50 hover:text-white"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-gold-400" : "text-wine-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Portal */}
        <div className="px-3 pb-2">
          <Link
            href="/portal"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-wine-300 hover:bg-wine-900/50 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-wine-800/40">
          <div className="flex items-center gap-2 text-[11px] text-wine-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Rotary Club of Fullerton
          </div>
          <p className="text-[10px] text-wine-600 mt-1">$1.3M+ in community donations</p>
        </div>
      </aside>
    </>
  );
}
