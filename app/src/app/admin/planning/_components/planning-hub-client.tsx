"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import {
  Compass,
  ShieldCheck,
  Wrench,
  Bot,
  Server,
  BarChart3,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RolesPermissionsTab from "./roles-permissions-tab";
import BuildStatusTab from "./build-status-tab";
import BrynConfigTab from "./bryn-config-tab";
import EnvironmentTab from "./environment-tab";
import PlatformAnalyticsTab from "./platform-analytics-tab";
import RogerChatTab from "./roger-chat-tab";

const tabs = [
  { value: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { value: "build", label: "Build Status", icon: Wrench },
  { value: "bryn", label: "Bryn Config", icon: Bot },
  { value: "environment", label: "Environment", icon: Server },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "roger", label: "Roger", icon: Terminal },
];

export function PlanningHubClient() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
          <Compass className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning Hub</h1>
          <p className="text-sm text-gray-500">
            Platform command center &mdash; super_admin only
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2",
                  isActive
                    ? "border-amber-500 text-gray-900 bg-amber-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-amber-600" : "text-gray-400"
                  )}
                />
                {tab.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Content value="roles">
            <RolesPermissionsTab />
          </Tabs.Content>
          <Tabs.Content value="build">
            <BuildStatusTab />
          </Tabs.Content>
          <Tabs.Content value="bryn">
            <BrynConfigTab />
          </Tabs.Content>
          <Tabs.Content value="environment">
            <EnvironmentTab />
          </Tabs.Content>
          <Tabs.Content value="analytics">
            <PlatformAnalyticsTab />
          </Tabs.Content>
          <Tabs.Content value="roger">
            <RogerChatTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
