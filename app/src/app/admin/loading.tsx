import { Skeleton } from "@/components/skeletons/Skeleton";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-2 shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
        <div className="flex-1" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <AdminDashboardSkeleton />
      </div>
    </div>
  );
}
