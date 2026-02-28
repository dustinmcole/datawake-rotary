import type { Metadata } from "next";
import { UncorkedSidebar } from "@/components/layout/uncorked-sidebar";
import { requireAnyRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Fullerton Uncorked — Planning Hub",
  description: "Collaborative planning platform for the Fullerton Uncorked wine & food tasting fundraiser.",
};

export default async function UncorkedHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require uncorked_committee, club_admin, or super_admin
  await requireAnyRole(["super_admin", "club_admin", "uncorked_committee"]);

  return (
    <div className="flex min-h-screen">
      <UncorkedSidebar />
      <main className="flex-1 lg:ml-[var(--sidebar-width)] pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
