
import { Skeleton } from "@/components/skeletons/Skeleton";
import { CalendarDays, CheckCircle, Users, Zap } from "lucide-react";

export function PortalDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-52 rounded-xl" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-28 mt-2" />
            </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next meeting */}
        <div className="bg-blue-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded-full bg-blue-600" />
                <Skeleton className="w-24 h-3 bg-blue-600" />
            </div>
            <Skeleton className="h-6 w-56 mb-1 bg-blue-600" />
            <Skeleton className="h-4 w-48 mb-5 bg-blue-600" />
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full flex-shrink-0 bg-blue-600" />
                    <Skeleton className="h-4 w-40 bg-blue-600" />
                </div>
                <div className="flex items-center gap-2 ml-6">
                    <Skeleton className="h-3 w-48 bg-blue-600" />
                </div>
            </div>
            <Skeleton className="h-4 w-32 mt-5 bg-blue-600" />
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                      <Skeleton className="flex-shrink-0 w-11 h-11 rounded-xl" />
                      <div className="min-w-0 flex-1 mt-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4 mt-1.5" />
                      </div>
                  </div>
              ))}
            </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                  <div key={i} className="pl-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2 mt-1.5" />
                  </div>
              ))}
            </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
