"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, CalendarDays, ScrollText, FileText, CheckSquare, Users, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/board", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/board/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/board/resolutions", label: "Resolutions", icon: ScrollText },
  { href: "/board/documents", label: "Documents", icon: FileText },
  { href: "/board/action-items", label: "Action Items", icon: CheckSquare },
  { href: "/board/officers", label: "Officers", icon: Users },
];

export function BoardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const Nav = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="font-bold text-gray-900 text-lg">Board Portal</div>
        <div className="text-xs text-gray-500 mt-0.5">Fullerton Rotary Club</div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href, exact) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100")}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200"><UserButton afterSignOutUrl="/login" /></div>
    </div>
  );
  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
        <span className="font-semibold text-gray-900">Board Portal</span>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl z-50">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            <Nav />
          </div>
        </div>
      )}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 w-56 bg-white border-r border-gray-200 z-20"><Nav /></aside>
    </>
  );
}
