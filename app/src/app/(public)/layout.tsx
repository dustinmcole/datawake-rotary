import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getEventConfig } from "@/lib/queries/event-config";

export const metadata: Metadata = {
  title: "Fullerton Uncorked 2026",
  description:
    "An evening of fine wine, craft beer, and culinary excellence benefiting the Rotary Club of Fullerton. October 17, 2026 at the Fullerton Family YMCA.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let ticketUrl: string | undefined;
  try {
    const config = await getEventConfig();
    ticketUrl = config.ticketUrlGeneral || undefined;
  } catch {
    // DB not yet configured — render without ticket link
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream-50">
      <PublicHeader ticketUrl={ticketUrl} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
