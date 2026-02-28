"use client";

import { MessageSquare, Wine, Sparkles, Search, DollarSign, Star, Store, Lock } from "lucide-react";

// Bryn chat page for Uncorked Hub context
// This is a placeholder — Terminal 4 (Bryn AI Integration) will build the full chat UI
// When the chat API is ready, this page will embed it with agentContext='uncorked'

export default function UncorkedBrynPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 p-8 lg:p-10 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="w-5 h-5 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold">Uncorked Hub</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
              <MessageSquare className="w-6 h-6 text-wine-950" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Ask Bryn</h1>
              <p className="text-wine-200 text-sm">Your Uncorked planning assistant</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-gold-400/10 to-transparent" />
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-2xl bg-white border border-gray-100 p-8 lg:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wine-100 to-wine-200 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-wine-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bryn Chat — Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Bryn&apos;s Uncorked planning context is being built. When ready, you&apos;ll be able to search
          sponsors, look up vendors, pull budget summaries, and get event planning help — all from this chat.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wine-50 text-wine-700 text-sm font-medium border border-wine-100">
          <div className="w-2 h-2 rounded-full bg-wine-400 animate-pulse" />
          Terminal 4 in progress
        </div>
      </div>

      {/* What Bryn can do in this context */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What Bryn can do for Uncorked</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Search,
              title: "Search Sponsors",
              description: "Find sponsors by tier, status, or contact — with full CRM history",
              color: "from-wine-500 to-wine-600",
            },
            {
              icon: Store,
              title: "Search Vendors",
              description: "Look up vendors by category, availability, or previous participation",
              color: "from-amber-500 to-amber-600",
            },
            {
              icon: DollarSign,
              title: "Budget Summary",
              description: "Pull current P&L, forecast net profit, track expenses vs budget",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              icon: Star,
              title: "Sponsor Outreach",
              description: "Draft personalized outreach emails for sponsor prospects",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: MessageSquare,
              title: "Meeting Summaries",
              description: "Summarize meeting notes and extract action items automatically",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: Lock,
              title: "Role-Based Access",
              description: "All Uncorked tools require uncorked_committee role or higher",
              color: "from-gray-500 to-gray-600",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bryn governance notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Bryn is managed by Datawake</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Bryn&apos;s configuration, tools, and personality are managed exclusively by Datawake.
            To request changes to Bryn&apos;s behavior, contact{" "}
            <a href="mailto:dustin@datawake.io" className="underline font-medium">
              dustin@datawake.io
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
