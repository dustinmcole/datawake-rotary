"use client";

import { useEffect, useState } from "react";
import {
  Wine,
  FileText,
  CheckSquare,
  DollarSign,
  Star,
  Store,
  ArrowRight,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import Link from "next/link";
import { getTimeUntilEvent, formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const [countdown, setCountdown] = useState(getTimeUntilEvent());
  const [stats, setStats] = useState({
    meetings: 0,
    tasks: { total: 0, done: 0 },
    budget: { income: 0, expenses: 0 },
    sponsors: { total: 0, confirmed: 0 },
    vendors: { total: 0, confirmed: 0 },
  });

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeUntilEvent()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/meetings").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/budget").then((r) => r.json()),
      fetch("/api/contacts?type=sponsor,potential_sponsor").then((r) => r.json()),
      fetch("/api/contacts?type=vendor,potential_vendor").then((r) => r.json()),
    ])
      .then(([meetings, tasks, budget, sponsors, vendors]) => {
        setStats({
          meetings: Array.isArray(meetings) ? meetings.length : 0,
          tasks: {
            total: Array.isArray(tasks) ? tasks.length : 0,
            done: Array.isArray(tasks) ? tasks.filter((t: { status: string }) => t.status === "done").length : 0,
          },
          budget: {
            income: Array.isArray(budget)
              ? budget.filter((b: { type: string }) => b.type === "income").reduce((sum: number, b: { amount: number }) => sum + Number(b.amount), 0)
              : 0,
            expenses: Array.isArray(budget)
              ? budget.filter((b: { type: string }) => b.type === "expense").reduce((sum: number, b: { amount: number }) => sum + Number(b.amount), 0)
              : 0,
          },
          sponsors: {
            total: Array.isArray(sponsors) ? sponsors.length : 0,
            confirmed: Array.isArray(sponsors) ? sponsors.filter((c: { status: string }) => c.status === "confirmed").length : 0,
          },
          vendors: {
            total: Array.isArray(vendors) ? vendors.length : 0,
            confirmed: Array.isArray(vendors) ? vendors.filter((c: { status: string }) => c.status === "confirmed").length : 0,
          },
        });
      })
      .catch(() => {
        // DB not yet configured — stats will show zeros
      });
  }, []);

  const netProfit = stats.budget.income - stats.budget.expenses;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 p-8 lg:p-10 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="w-5 h-5 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold">Fullerton Uncorked 2026</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-1">Event Planning Hub</h1>
          <p className="text-wine-200 text-sm mb-8 max-w-xl">
            Collaborative workspace for the Rotary Club of Fullerton&apos;s signature fundraising event.
            Fine wine, craft beer, and culinary excellence for community impact.
          </p>

          {/* Countdown */}
          <div className="flex gap-4 lg:gap-6">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hours" },
              { value: countdown.minutes, label: "Minutes" },
              { value: countdown.seconds, label: "Seconds" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gold-400 tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-wine-300 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-gold-400/10 to-transparent" />
        <div className="absolute -right-5 -bottom-14 w-64 h-64 rounded-full bg-gradient-to-br from-wine-600/20 to-transparent" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <QuickStatCard
          href="/uncorked-hub/meetings"
          icon={FileText}
          label="Meetings"
          value={stats.meetings.toString()}
          subtitle="meeting notes recorded"
          color="blue"
        />
        <QuickStatCard
          href="/uncorked-hub/tasks"
          icon={CheckSquare}
          label="Tasks"
          value={`${stats.tasks.done}/${stats.tasks.total}`}
          subtitle="tasks completed"
          color="purple"
        />
        <QuickStatCard
          href="/uncorked-hub/budget"
          icon={DollarSign}
          label="Net Profit"
          value={formatCurrency(netProfit)}
          subtitle={`${formatCurrency(stats.budget.income)} income`}
          color={netProfit >= 0 ? "green" : "red"}
        />
        <QuickStatCard
          href="/uncorked-hub/sponsors"
          icon={Star}
          label="Sponsors"
          value={stats.sponsors.total.toString()}
          subtitle={`${stats.sponsors.confirmed} confirmed`}
          color="wine"
        />
        <QuickStatCard
          href="/uncorked-hub/vendors"
          icon={Store}
          label="Vendors"
          value={stats.vendors.total.toString()}
          subtitle={`${stats.vendors.confirmed} confirmed`}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-wine-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/uncorked-hub/meetings", label: "Record Meeting Notes", desc: "Document discussions and action items", icon: FileText, color: "from-blue-500 to-blue-600" },
            { href: "/uncorked-hub/tasks", label: "Manage Tasks", desc: "Track what needs to be done", icon: CheckSquare, color: "from-purple-500 to-purple-600" },
            { href: "/uncorked-hub/budget", label: "Update Budget", desc: "Track expenses and revenue", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
            { href: "/uncorked-hub/sponsors", label: "Manage Sponsors", desc: "Cultivate sponsor partnerships", icon: Star, color: "from-wine-600 to-wine-700" },
            { href: "/uncorked-hub/vendors", label: "Manage Vendors", desc: "Food, beer, wine & entertainment", icon: Store, color: "from-amber-500 to-amber-600" },
            { href: "/uncorked-hub/sponsors", label: "Sponsor Outreach", desc: "Prospect past sponsors for 2026", icon: Target, color: "from-rose-500 to-rose-600" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 card-hover"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-wine-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Event Info */}
      <div className="rounded-xl bg-white border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-wine-900 mb-4">About the Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What</h3>
            <p className="text-gray-600">
              An evening of fine wine, craft beer, and culinary bites from local artisans.
              Featuring tastings from regional vintners, a craft beer garden, food from Fullerton&apos;s
              top chefs, and DJ&apos;d entertainment.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Who Benefits</h3>
            <p className="text-gray-600">
              Proceeds benefit the Fullerton Rotary Foundation (est. 1991), supporting local
              nonprofits, community initiatives, and youth-in-need programs. Over $1.3M donated to date.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <ul className="text-gray-600 space-y-1">
              <li><strong>Date:</strong> October 17, 2026</li>
              <li><strong>Time:</strong> 5:00 PM – 9:00 PM</li>
              <li><strong>Venue:</strong> Fullerton YMCA</li>
              <li><strong>Tickets:</strong> Presale only, limited capacity</li>
              <li><strong>2024 Result:</strong> 350 guests, $70K+ net</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({
  href, icon: Icon, label, value, subtitle, color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    wine: "from-wine-600 to-wine-700",
  };

  return (
    <Link href={href} className="group p-5 rounded-xl bg-white border border-gray-100 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.wine} flex items-center justify-center`}>
          <Icon className="w-[18px] h-[18px] text-white" />
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-wine-500 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </Link>
  );
}
