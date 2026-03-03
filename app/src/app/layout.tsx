import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fullerton Rotary Club",
  description: "Fullerton Rotary Club — Serving the community since 1924.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster richColors position="bottom-right" duration={5000} toastOptions={{ classNames: { toast: "rotary-toast", error: "rotary-toast-error", success: "rotary-toast-success", warning: "rotary-toast-warning" } }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
