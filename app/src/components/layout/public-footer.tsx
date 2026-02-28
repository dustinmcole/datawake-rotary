import Link from "next/link";
import { Wine, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-wine-950 border-t border-wine-800/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Wine className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm">Fullerton Uncorked</span>
                <span className="block text-[10px] text-gold-400/80 tracking-widest uppercase -mt-0.5">Est. 2013</span>
              </div>
            </div>
            <p className="text-wine-300 text-sm leading-relaxed">
              A signature fundraising event of the Rotary Club of Fullerton,
              featuring fine wine, craft beer, and culinary excellence for community impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/sponsors", label: "Sponsors" },
                { href: "/vendors", label: "Vendors" },
                { href: "/vendor-interest", label: "Vendor Interest Form" },
                { href: "/about", label: "About the Event" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-wine-300 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Event Details</h3>
            <ul className="space-y-2.5 text-sm text-wine-300">
              <li><span className="text-white font-medium">Date:</span> October 17, 2026</li>
              <li><span className="text-white font-medium">Time:</span> 5:00 PM – 9:00 PM</li>
              <li><span className="text-white font-medium">Venue:</span> Fullerton Family YMCA</li>
              <li><span className="text-white font-medium">Address:</span> 201 S Basque Ave, Fullerton, CA</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-wine-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-wine-400 text-xs">
            &copy; {new Date().getFullYear()} Rotary Club of Fullerton. All rights reserved.
          </p>
          <p className="text-wine-400 text-xs flex items-center gap-1">
            Proceeds benefit the Fullerton Rotary Foundation
            <Heart className="w-3 h-3 text-wine-500 inline ml-1" />
          </p>
        </div>
      </div>
    </footer>
  );
}
