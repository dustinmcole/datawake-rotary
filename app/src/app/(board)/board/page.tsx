import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAllBoardMeetings, getAllBoardActionItems, getAllResolutions, getAllOfficerTerms } from "@/lib/queries/board";
import { CalendarDays, ScrollText, CheckSquare, Users, FileText, ArrowRight } from "lucide-react";

export default async function BoardDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.roles.some((r) => ["super_admin", "club_admin", "board_member"].includes(r))) redirect("/portal");

  const [meetings, actionItems, resolutions, officers] = await Promise.all([
    getAllBoardMeetings().catch(() => []),
    getAllBoardActionItems().catch(() => []),
    getAllResolutions().catch(() => []),
    getAllOfficerTerms().catch(() => []),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = meetings.filter((m) => m.date >= today).slice(0, 3);
  const openActions = actionItems.filter((a) => a.status !== "done" && a.status !== "cancelled").length;
  const recent = resolutions.slice(0, 5);

  const stats = [
    { label: "Upcoming Meetings", value: upcoming.length, href: "/board/meetings", icon: CalendarDays, c: "text-blue-600 bg-blue-50" },
    { label: "Open Action Items", value: openActions, href: "/board/action-items", icon: CheckSquare, c: "text-orange-600 bg-orange-50" },
    { label: "Resolutions", value: resolutions.length, href: "/board/resolutions", icon: ScrollText, c: "text-purple-600 bg-purple-50" },
    { label: "Active Officers", value: officers.filter((o) => o.active).length, href: "/board/officers", icon: Users, c: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Board Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Governance overview for board members</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${s.c}`}><s.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Meetings</h2>
            <Link href="/board/meetings" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No upcoming meetings</p> : (
            <div className="space-y-3">
              {upcoming.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 text-center border border-gray-200 rounded-lg py-1">
                    <div className="text-xs text-gray-400">{new Date(m.date + "T12:00:00").toLocaleString("en-US", { month: "short" })}</div>
                    <div className="text-lg font-bold text-gray-900 leading-none">{new Date(m.date + "T12:00:00").getDate()}</div>
                  </div>
                  <div><div className="text-sm font-medium text-gray-900">{m.title}</div><div className="text-xs text-gray-500">{m.time || "Time TBD"}{m.location ? ` · ${m.location}` : ""}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Resolutions</h2>
            <Link href="/board/resolutions" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recent.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No resolutions yet</p> : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1.5">
                  <div><div className="text-sm font-medium text-gray-900">{r.title}</div><div className="text-xs text-gray-400">{r.date}</div></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "passed" ? "bg-green-100 text-green-700" : r.status === "failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ href: "/board/meetings", label: "Meetings", icon: CalendarDays }, { href: "/board/resolutions", label: "Resolutions", icon: ScrollText }, { href: "/board/documents", label: "Documents", icon: FileText }, { href: "/board/action-items", label: "Action Items", icon: CheckSquare }].map((l) => (
            <Link key={l.href} href={l.href} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-center">
              <l.icon className="w-5 h-5 text-gray-500" /><span className="text-xs text-gray-600">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
