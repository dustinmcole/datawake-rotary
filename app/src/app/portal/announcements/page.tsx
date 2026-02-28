import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPublishedAnnouncements } from "@/lib/queries/announcements";
import { formatDate } from "@/lib/utils";
import { Pin, Bell, AlertTriangle, Calendar, Users, Info } from "lucide-react";

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    border: string;
    bg: string;
  }
> = {
  urgent: {
    label: "Urgent",
    icon: AlertTriangle,
    color: "text-red-600",
    border: "border-red-300",
    bg: "bg-red-50",
  },
  event: {
    label: "Event",
    icon: Calendar,
    color: "text-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
  },
  committee: {
    label: "Committee",
    icon: Users,
    color: "text-purple-600",
    border: "border-purple-200",
    bg: "bg-purple-50",
  },
  general: {
    label: "General",
    icon: Info,
    color: "text-gray-600",
    border: "border-gray-200",
    bg: "bg-gray-50",
  },
};

export default async function AnnouncementsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const all = await getPublishedAnnouncements().catch(() => []);
  const pinned = all.filter((a) => a.pinned);
  const rest = all.filter((a) => !a.pinned);
  const announcements = [...pinned, ...rest];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">Club news, updates, and reminders</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for club news and updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const config = CATEGORY_CONFIG[a.category] ?? CATEGORY_CONFIG.general;
            const CategoryIcon = config.icon;
            return (
              <article
                key={a.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  a.category === "urgent"
                    ? "border-red-300 ring-1 ring-red-100"
                    : "border-gray-200"
                }`}
              >
                {/* Header bar */}
                <div
                  className={`px-6 py-3 ${config.bg} border-b ${config.border} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${config.color}`}
                    >
                      <CategoryIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <time className="text-xs text-gray-400">
                    {a.publishedAt ? formatDate(a.publishedAt) : ""}
                  </time>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {a.title}
                  </h2>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {a.content}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
