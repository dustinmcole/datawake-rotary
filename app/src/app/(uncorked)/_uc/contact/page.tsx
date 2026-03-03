import type { Metadata } from "next";
import { Wine, Mail, MapPin, Send } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact | Fullerton Uncorked 2026",
  description:
    "Get in touch with the Fullerton Uncorked team.",
};

export default function ContactPage() {
  return (
    <div className="bg-cream-50">
      <section className="relative bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-wine-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Mail className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 tracking-tight">Contact Us</h1>
          <p className="text-xl text-wine-200 leading-relaxed max-w-2xl mx-auto">
            Questions, sponsorships, vendor inquiries &mdash; we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-wine-950 mb-4">Get In Touch</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our team is happy to answer questions about tickets, sponsorships, vendor opportunities, or anything else about Fullerton Uncorked.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-wine-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-wine-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</div>
                    <a href="mailto:info@fullertonuncorked.org" className="text-wine-700 text-sm font-medium hover:text-wine-500">
                      info@fullertonuncorked.org
                    </a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-wine-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-wine-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Event Venue</div>
                    <address className="text-sm text-gray-600 not-italic leading-relaxed">
                      Fullerton Family YMCA<br />
                      400 W. Commonwealth Ave<br />
                      Fullerton, CA 92832
                    </address>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-wine-100 flex items-center justify-center flex-shrink-0">
                    <Wine className="w-4 h-4 text-wine-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Event Date</div>
                    <div className="text-sm text-gray-600">Saturday, October 17, 2026<br />6:00 PM – 10:00 PM</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-gold-600" />
                  <span className="text-sm font-bold text-gold-800">Sponsorship Inquiries</span>
                </div>
                <p className="text-xs text-gold-700 leading-relaxed">
                  Email us at{" "}
                  <a href="mailto:sponsor@fullertonuncorked.org" className="font-semibold underline">
                    sponsor@fullertonuncorked.org
                  </a>{" "}
                  for our 2026 sponsorship prospectus.
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-wine-100 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-wine-950 mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
