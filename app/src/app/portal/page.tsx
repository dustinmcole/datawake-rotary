import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUpcomingClubEvents } from "@/lib/queries/events-club";
import { getPublishedAnnouncements } from "@/lib/queries/announcements";
import { getAttendanceByUser, getRotaryYear, getWeeksElapsedInRotaryYear } from "@/lib/queries/attendance";
import { formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Bell,
  Zap,
  ChevronRight,
} from "lucide-react";

export default async function PortalDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rotaryYear = getRotaryYear();

  const [events, announcements, attendanceRecords] = await Promise.all([
    getUpcomingClubEvents().catch(() => []),
    getPublishedAnnouncements().catch(() => []),
    user.dbUser
      ? getAttendanceByUser(user.dbUser.id).catch(() => [])
      : Promise.resolve([]),
  ]);

  const upcomingEvents = events.filter((e) => e.status === "approved").slice(0, 5);
  const recentAnnouncements = announcements.slice(0, 3);

  // Attendance stats for current Rotary year
  const ryRecords = attendanceRecords.filter(
    (r) => r.date >= rotaryYear.start && r.date <= rotaryYear.end
  );
  const regularCount = ryRecords.filter((r) => r.type === "regular").length;
  const makeupCount = ryRecords.filter((r) => r.type === "makeup").length;
  const weeksElapsed = getWeeksElapsedInRotaryYear(rotaryYear.start);
  const attendanceRate = Math.min(
    100,
    Math.round(((regularCount + makeupCount) / weeksElapsed) * 100)
  );

  const firstName = user.firstName || user.email.split("@")[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-gray-500">Fullerton Rotary Club Member Portal</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Rotary Year {rotaryYear.label}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          sub="This Rotary year"
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="Regular Meetings"
          value={regularCount.toString()}
          sub="Attended this year"
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <StatCard
          label="Makeups"
          value={makeupCount.toString()}
          sub="This Rotary year"
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="Upcoming Events"
          value={upcomingEvents.length.toString()}
          sub="Approved events"
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next meeting */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
              Next Meeting
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1">Weekly Lunch Meeting</h3>
          <p className="text-blue-200 text-sm mb-5">Every Wednesday at 12:00 PM</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Coyote Hills Country Club</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200 text-xs ml-6">
              <span>1440 E Bastanchury Rd, Fullerton</span>
            </div>
          </div>
          <Link
            href="/portal/attendance"
            className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white transition-colors"
          >
            Record attendance <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link
              href="/portal/events"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No upcoming events.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date + "T00:00:00");
                return (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-11 h-11 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                      <span className="text-[9px] text-blue-500 font-semibold uppercase leading-none">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-base font-bold text-blue-700 leading-tight">
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {event.startTime ? `${event.startTime} · ` : ""}
                        {event.location || "Location TBD"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Announcements
            </h2>
            <Link
              href="/portal/announcements"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No announcements.</p>
          ) : (
            <div className="space-y-4">
              {recentAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className={`border-l-2 pl-3 ${
                    a.category === "urgent"
                      ? "border-red-400"
                      : a.pinned
                      ? "border-amber-400"
                      : "border-gray-200"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.publishedAt ? formatDate(a.publishedAt) : "Draft"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            href="/portal/attendance"
            icon={CheckCircle}
            label="Record Attendance"
            colorClass="bg-blue-600 hover:bg-blue-700"
          />
          <QuickAction
            href="/portal/events"
            icon={CalendarDays}
            label="Submit Event"
            colorClass="bg-amber-500 hover:bg-amber-600"
          />
          <QuickAction
            href="/portal/directory"
            icon={Users}
            label="Member Directory"
            colorClass="bg-green-600 hover:bg-green-700"
          />
          <QuickAction
            href="/portal/bryn"
            icon={Zap}
            label="Ask Bryn"
            colorClass="bg-purple-600 hover:bg-purple-700"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  colorClass,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bgClass,
}: {
  label: string;
  value: string;
  sub: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  colorClass,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colorClass: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 ${colorClass} text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors shadow-sm`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
