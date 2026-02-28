import Link from "next/link";
import { MapPin, Clock, Phone, Mail, ExternalLink } from "lucide-react";

export function RotaryFooter() {
  return (
    <footer className="bg-navy-700 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-2">Fullerton Rotary Club</h3>
            <p className="text-navy-200 text-sm leading-relaxed mb-4">
              Serving the Fullerton community since 1924. Guided by the motto
              &ldquo;Service Above Self&rdquo; and the Four-Way Test.
            </p>
            <p className="text-navy-300 text-xs">
              District 5320 &middot; Rotary International
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Our Club" },
                { href: "/programs", label: "Programs & Service" },
                { href: "/events", label: "Upcoming Events" },
                { href: "/join", label: "Become a Member" },
                { href: "/uncorked", label: "Fullerton Uncorked" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-200 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Meeting Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-4">
              Weekly Meeting
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Every Wednesday</p>
                  <p className="text-sm text-navy-200">12:00 PM &ndash; 1:30 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Coyote Hills Country Club</p>
                  <p className="text-sm text-navy-200">1440 E Bastanchury Rd</p>
                  <p className="text-sm text-navy-200">Fullerton, CA 92835</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href="mailto:info@fullertonrotaryclub.com"
                  className="text-sm text-navy-200 hover:text-white transition-colors"
                >
                  info@fullertonrotaryclub.com
                </a>
              </li>
              {/* TODO: Replace with real club phone number */}
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-sm text-navy-200">(714) 773-9642</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href="https://www.rotary.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-200 hover:text-white transition-colors"
                >
                  Rotary International
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-navy-300 text-xs">
              &copy; {new Date().getFullYear()} Rotary Club of Fullerton. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-navy-300 hover:text-white text-xs transition-colors">
                Member Portal
              </Link>
              <span className="text-navy-600">|</span>
              <a
                href="https://www.rotary.org/en/get-involved/find-a-club"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-300 hover:text-white text-xs transition-colors"
              >
                Find a Club
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
