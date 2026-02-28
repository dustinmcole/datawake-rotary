"use client";

import { Terminal, GitBranch, Clock } from "lucide-react";

export default function RogerChatTab() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
          <Terminal className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Roger</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
              Build Agent
            </span>
          </div>
          <p className="text-xs text-gray-500">Autonomous developer agent (OpenClaw / Gemini)</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-600">
          Roger is an autonomous build agent that works via git — not interactive chat.
          He picks up tasks from BUILD-COORD.md and posts updates to #internal-rotary on Slack.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <GitBranch className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Branch Pattern</p>
              <p className="text-xs text-gray-500 mt-0.5">roger/&#123;feature-name&#125; → PR to main</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Work Loop</p>
              <p className="text-xs text-gray-500 mt-0.5">Cron-based, posts to Slack on milestones</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          Config: ROGER-CONFIG.md &middot; Handoff: ROGER-HANDOFF.md &middot; Coordination: BUILD-COORD.md
        </div>
      </div>
    </div>
  );
}
