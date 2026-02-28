import type { Metadata } from "next";
import { RotaryHeader } from "@/components/layout/rotary-header";
import { RotaryFooter } from "@/components/layout/rotary-footer";

export const metadata: Metadata = {
  title: {
    default: "Fullerton Rotary Club — Service Above Self",
    template: "%s | Fullerton Rotary Club",
  },
  description:
    "The Rotary Club of Fullerton has served the community since 1924. Join us every Wednesday at Coyote Hills Country Club.",
};

export default function RotaryPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <RotaryHeader />
      <main className="flex-1">{children}</main>
      <RotaryFooter />
    </div>
  );
}
