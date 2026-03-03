import Link from "next/link";
import {
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  Globe,
  ArrowRight,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Rotary Club of Fullerton. Meeting location, times, and how to reach us.",
  openGraph: {
    title: "Contact Us | Fullerton Rotary Club",
    description: "Get in touch with the Rotary Club of Fullerton. Meeting location, times, and how to reach us.",
    url: "https://www.fullertonrotary.org/contact",
    siteName: "Fullerton Rotary Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Fullerton Rotary Club",
    description: "Get in touch with the Rotary Club of Fullerton. Meeting location, times, and how to reach us.",
  },
};

const CONTACT_CARDS = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: [
      "Coyote Hills Country Club",
      "1440 E Bastanchury Rd",
      "Fullerton, CA 92835",
    ],
    note: "Meeting location",
  },
  {
    icon: Clock,
    title: "Meeting Times",
    lines: ["Every Wednesday", "12:00 PM \u2013 1:30 PM"],
    note: "Guests always welcome",
  },
  {
    icon: Mail,
    title: "Email Us",
    lines: ["info@fullertonrotaryclub.com"],
    note: null,
    href: "mailto:info@fullertonrotaryclub.com",
  },
];

const ROTARY_LINKS = [
  {
    label: "Rotary International",
    href: "https://www.rotary.org",
    description: "Learn about Rotary\u2019s global mission and programs",
  },
  {
    label: "District 5320",
    href: "https://district5320.org",
    description: "Our district covering Southern California",
  },
  {
    label: "Find a Rotary Club",
    href: "https://my.rotary.org/en/search/club-finder",
    description: "Locate a Rotary club near you",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-navy-200 text-sm font-medium uppercase tracking-wider mb-3">
            Rotary Club of Fullerton
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-navy-100 text-lg">
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {CONTACT_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-navy-50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
                  <card.icon className="w-6 h-6 text-navy-700" />
                </div>
                <h3 className="font-semibold text-navy-800 text-lg mb-3">
                  {card.title}
                </h3>
                <div className="space-y-0.5">
                  {card.lines.map((line, i) =>
                    card.href && i === 0 ? (
                      <a
                        key={i}
                        href={card.href}
                        className="text-navy-700 hover:text-gold-600 font-medium transition-colors block"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-navy-600">
                        {line}
                      </p>
                    )
                  )}
                </div>
                {card.note && (
                  <p className="text-navy-400 text-sm mt-3">{card.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gold-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy-800 mb-2">
                    Coyote Hills Country Club
                  </h2>
                  <p className="text-navy-600 text-lg mb-1">
                    1440 E Bastanchury Rd, Fullerton, CA 92835
                  </p>
                  <p className="text-navy-500 mb-6">
                    Our meetings are held in the main dining room. Free parking
                    is available on site.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Coyote+Hills+Country+Club+Fullerton+CA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General Inquiry Note */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-8 text-center">
            <h3 className="font-semibold text-navy-800 text-lg mb-3">
              Looking for Something Specific?
            </h3>
            <p className="text-navy-600 leading-relaxed">
              For membership inquiries, please visit our{" "}
              <Link
                href="/join"
                className="text-navy-700 font-semibold hover:text-gold-600 underline underline-offset-2 transition-colors"
              >
                Join page
              </Link>
              . For event information, check our{" "}
              <Link
                href="/events"
                className="text-navy-700 font-semibold hover:text-gold-600 underline underline-offset-2 transition-colors"
              >
                Events page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Rotary Links */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy-800">Rotary Links</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ROTARY_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl border border-navy-100 p-6 hover:shadow-md hover:border-navy-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy-800 group-hover:text-navy-700 transition-colors">
                    {link.label}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-navy-300 group-hover:text-navy-600 transition-colors group-hover:translate-x-0.5 transform" />
                </div>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
