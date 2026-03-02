
import { Skeleton } from "@/components/skeletons/Skeleton";
import { ShieldCheck } from "lucide-react";

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-72 mt-1.5" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-4 h-4 rounded-full mt-1" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-24 mt-1.5" />
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white border border-gray-200">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 mt-1.5" />
                </div>
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3">
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 rounded w-32" />
                      <Skeleton className="h-3 rounded w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3">
                <div className="divide-y divide-gray-100">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3.5 rounded w-40" />
                                <Skeleton className="h-3 rounded w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends teaser */}
      <div className="rounded-xl bg-gray-800 p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl bg-gray-700" />
                <div>
                    <Skeleton className="h-5 w-64 bg-gray-700" />
                    <Skeleton className="h-4 w-72 mt-1.5 bg-gray-700" />
                </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
