import type { Metadata } from "next";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAnyRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Panel — Fullerton Rotary Club",
  description: "Administrative dashboard for the Fullerton Rotary Club platform.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["super_admin", "club_admin"]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-[var(--sidebar-width)] pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
