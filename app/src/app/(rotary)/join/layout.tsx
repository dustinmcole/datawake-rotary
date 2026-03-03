import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Become a member of the Rotary Club of Fullerton. Submit your membership interest form and we'll be in touch.",
  openGraph: {
    title: "Join Us | Fullerton Rotary Club",
    description:
      "Become a member of the Rotary Club of Fullerton. Submit your membership interest form and we'll be in touch.",
    url: "https://www.fullertonrotary.org/join",
    siteName: "Fullerton Rotary Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Us | Fullerton Rotary Club",
    description:
      "Become a member of the Rotary Club of Fullerton. Submit your membership interest form and we'll be in touch.",
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
