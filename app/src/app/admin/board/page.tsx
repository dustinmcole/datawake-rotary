import Link from "next/link";
import {
  Calendar,
  FileText,
  Users,
  CheckSquare,
  BookOpen,
  BarChart2,
} from "lucide-react";

const BOARD_SECTIONS = [
  {
    href: "/admin/board/meetings",
    icon: Calendar,
    label: "Board Meetings",
    description: "Schedule meetings, record agenda & minutes, track attendance.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    href: "/admin/board/resolutions",
    icon: FileText,
    label: "Resolutions & Voting",
    description: "Record resolutions with yea / nay / abstain vote counts.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    href: "/admin/board/officer-terms",
    icon: Users,
    label: "Officer Terms",
    description: "Track officer roles and their start / end dates.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    href: "/admin/board/action-items",
    icon: CheckSquare,
    label: "Action Items",
    description: "Kanban board: todo → in progress → done.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    href: "/admin/board/documents",
    icon: BookOpen,
    label: "Document Library",
    description: "Bylaws, policies, standing rules, and other governance docs.",
    color: "text-rose-600 bg-rose-50",
  },
  {
    href: "/admin/board/budget",
    icon: BarChart2,
    label: "Budget",
    description: "Annual budget vs. YTD actuals — coming soon.",
    color: "text-gray-400 bg-gray-50",
    disabled: true,
  },
];

export default function BoardPortalPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Board Portal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Governance tools for board members — meetings, resolutions, officer terms, action items, and documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOARD_SECTIONS.map(({ href, icon: Icon, label, description, color, disabled }) => {
          const card = (
            <div
              key={href}
              className={`relative rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className={`inline-flex rounded-lg p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-base font-semibold text-gray-900">{label}</h2>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
              {disabled && (
                <span className="absolute top-3 right-3 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              )}
            </div>
          );

          return disabled ? card : (
            <Link key={href} href={href}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
