import { Skeleton } from "@/components/skeletons/Skeleton";

export default function RotaryLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-blue-700 px-6 py-20 flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-96 bg-blue-600 mx-auto" />
        <Skeleton className="h-6 w-72 bg-blue-600 mx-auto" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-11 w-36 rounded-xl bg-blue-600" />
          <Skeleton className="h-11 w-36 rounded-xl bg-blue-600" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Section header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-56 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 p-6 space-y-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>

        {/* Text block */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </div>
  );
}
