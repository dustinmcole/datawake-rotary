import { Skeleton } from "@/components/skeletons/Skeleton";
import { PortalDashboardSkeleton } from "@/components/skeletons/PortalDashboardSkeleton";

export default function PortalLoading() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-2 shrink-0">
        <Skeleton className="h-10 w-40 mb-4" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
        <div className="flex-1" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <PortalDashboardSkeleton />
      </div>
    </div>
  );
}
