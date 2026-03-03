"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function KioskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center select-none">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h2>
      <p className="text-lg text-gray-400 mb-12 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again or contact the host."}
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-3 h-14 px-8 bg-blue-700 text-white text-lg font-semibold rounded-2xl hover:bg-blue-800 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 h-14 px-8 bg-gray-100 text-gray-700 text-lg font-semibold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
