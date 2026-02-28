"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  CheckCircle,
  Building2,
  CalendarDays,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Wine,
  ClipboardCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/directory", label: "Directory", icon: Users },
  { href: "/portal/profile", label: "My Profile", icon: UserCircle },
  { href: "/portal/attendance", label: "Attendance", icon: CheckCircle },
  { href: "/portal/committees", label: "Committees", icon: Building2 },
  { href: "/portal/events", label: "Events", icon: CalendarDays },
  { href: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { href: "/portal/bryn", label: "Ask Bryn", icon: MessageCircle },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const roles = (user?.publicMetadata?.roles as string[]) ?? [];
  const showAdmin = roles.some((r) => ["super_admin", "club_admin", "board_member", "website_admin"].includes(r));
  const showUncorked = roles.some((r) => ["super_admin", "club_admin", "uncorked_committee"].includes(r));
  const showCheckin = roles.some((r) => ["super_admin", "club_admin", "board_member", "checkin_operator"].includes(r));

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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white flex items-center px-4 z-50 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-bold text-sm">Fullerton Rotary</span>
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
          "fixed top-0 bottom-0 w-[var(--sidebar-width)] bg-slate-900 text-white flex flex-col z-50 transition-transform duration-200",
          "lg:left-0 lg:translate-x-0",
          open ? "left-0 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/portal" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">Fullerton</h1>
              <p className="text-[11px] text-slate-400 tracking-widest uppercase">Rotary Club</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-blue-400" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}

          {/* Divider + role-gated links */}
          {(showAdmin || showUncorked || showCheckin) && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              {showCheckin && (
                <Link
                  href="/portal/checkin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
                >
                  <ClipboardCheck className="w-[18px] h-[18px] text-slate-600" />
                  Check-In
                </Link>
              )}
              {showAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
                >
                  <ShieldCheck className="w-[18px] h-[18px] text-slate-600" />
                  Admin Panel
                </Link>
              )}
              {showUncorked && (
                <Link
                  href="/uncorked-hub"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
                >
                  <Wine className="w-[18px] h-[18px] text-slate-600" />
                  Uncorked Hub
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 truncate">Member Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
