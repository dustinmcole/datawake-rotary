import Link from "next/link";
import { RotaryHeader } from "@/components/layout/rotary-header";
import { RotaryFooter } from "@/components/layout/rotary-footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <RotaryHeader />
      <main className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Page Not Found</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <span className="inline-block px-8 py-3 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-md transition-colors">
            Return Home
          </span>
        </Link>
      </main>
      <RotaryFooter />
    </div>
  );
}
