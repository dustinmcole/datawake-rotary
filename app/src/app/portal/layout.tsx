import type { Metadata } from "next";
import { PortalSidebar } from "@/components/layout/portal-sidebar";

export const metadata: Metadata = {
  title: "Member Portal — Fullerton Rotary Club",
  description: "Fullerton Rotary Club member portal.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PortalSidebar />
      <main className="flex-1 lg:ml-[var(--sidebar-width)] pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
