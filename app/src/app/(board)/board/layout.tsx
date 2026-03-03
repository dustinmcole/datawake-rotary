export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { BoardSidebar } from "@/components/layout/board-sidebar";
export const metadata: Metadata = { title: "Board Portal — Fullerton Rotary Club" };
export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <BoardSidebar />
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
