"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Building2,
  CalendarDays,
  Megaphone,
  Globe,
  BarChart3,
  Settings,
  Compass,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CheckCircle },
  { href: "/admin/committees", label: "Committees", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/website", label: "Website (CMS)", icon: Globe },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/uncorked-hub", label: "Planning Hub", icon: Compass },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 text-white flex items-center px-4 z-50 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <ShieldCheck className="w-5 h-5 text-amber-400" />
        <span className="font-bold text-sm">Admin Panel</span>
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
          "fixed top-0 bottom-0 w-[var(--sidebar-width)] bg-gray-900 text-white flex flex-col z-50 transition-transform duration-200",
          "lg:left-0 lg:translate-x-0",
          open ? "left-0 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">Admin</h1>
              <p className="text-[11px] text-gray-400 tracking-widest uppercase">Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-amber-400" : "text-gray-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Portal */}
        <div className="px-3 pb-2">
          <Link
            href="/portal"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/60 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            Admin Access Required
          </div>
        </div>
      </aside>
    </>
  );
}
