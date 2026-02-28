import { Shield, Clock, MapPin, Globe, Users, Handshake, Star } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Learn about the Rotary Club of Fullerton — serving the community since 1924. Our history, the Four-Way Test, mission, and meeting information.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Page Header */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-navy-200 text-sm font-medium uppercase tracking-wider mb-3">
            Rotary Club of Fullerton
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Fullerton Rotary
          </h1>
          <p className="text-navy-100 text-lg">
            Service Above Self since 1924
          </p>
        </div>
      </section>

      {/* Club History */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className="text-3xl font-bold text-navy-800">
              A Century of Service
            </h2>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed">
            <p>
              The Rotary Club of Fullerton was chartered in 1924 and is one of
              the oldest and most active clubs in District 5320. For over 100
              years, our members have dedicated themselves to making a
              difference — in Fullerton, across Southern California, and around
              the world.
            </p>
            <p>
              We are part of Rotary International, the world&apos;s first
              service club organization, founded in 1905 by Paul Harris in
              Chicago. Today, Rotary connects 1.4 million members across more
              than 46,000 clubs worldwide, united by a shared commitment to
              humanitarian service and ethical leadership.
            </p>
          </div>
        </div>
      </section>

      {/* The Four-Way Test */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border-l-4 border-gold-500 shadow-sm p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-7 h-7 text-navy-700" />
              <h2 className="text-3xl font-bold text-navy-800">
                The Four-Way Test
              </h2>
            </div>
            <p className="text-navy-600 text-lg mb-8">
              Of the things we think, say or do:
            </p>
            <ol className="space-y-5">
              {[
                { num: "1", text: "Is it the TRUTH?" },
                { num: "2", text: "Is it FAIR to all concerned?" },
                {
                  num: "3",
                  text: "Will it build GOODWILL and BETTER FRIENDSHIPS?",
                },
                { num: "4", text: "Will it be BENEFICIAL to all concerned?" },
              ].map((item) => (
                <li key={item.num} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-navy-700 text-white font-bold text-sm flex items-center justify-center">
                    {item.num}
                  </span>
                  <span className="text-navy-800 text-xl font-semibold pt-1">
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-navy-500 text-sm mt-8">
              Adopted by Rotary International in 1943, the Four-Way Test has
              been translated into over 100 languages and serves as an ethical
              guide for Rotarians worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className="text-3xl font-bold text-navy-800">Our Mission</h2>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed">
            <p className="text-2xl font-semibold text-navy-800 italic">
              &ldquo;Service Above Self&rdquo;
            </p>
            <p>
              The Rotary motto guides everything we do. As a club, we focus on
              four pillars of impact: community service that strengthens
              Fullerton and its neighbors, youth development that invests in the
              next generation, international partnerships that address global
              challenges, and vocational excellence that promotes integrity in
              every profession.
            </p>
            <p>
              Our members come from every walk of life — business owners,
              educators, healthcare professionals, public servants, retirees,
              and more — all united by the belief that together, we can create
              lasting, positive change.
            </p>
          </div>
        </div>
      </section>

      {/* Meeting Information */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-800 mb-8">
            Meeting Information
          </h2>
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-navy-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-800 text-lg mb-1">
                    When
                  </h3>
                  <p className="text-navy-600">Every Wednesday</p>
                  <p className="text-navy-600">12:00 PM &ndash; 1:30 PM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-navy-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-800 text-lg mb-1">
                    Where
                  </h3>
                  <p className="text-navy-600">Coyote Hills Country Club</p>
                  <p className="text-navy-600">
                    1440 E Bastanchury Rd, Fullerton CA 92835
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-navy-100">
              <p className="text-navy-600 text-lg">
                <Users className="w-5 h-5 inline-block mr-2 text-gold-600" />
                <span className="font-medium text-navy-800">
                  Guests are always welcome.
                </span>{" "}
                Join us for lunch, meet our members, and see Rotary in action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* District & International */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className="text-3xl font-bold text-navy-800">
              District &amp; International
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-navy-50 rounded-xl p-6">
              <h3 className="font-semibold text-navy-800 text-lg mb-3">
                District 5320
              </h3>
              <p className="text-navy-600 leading-relaxed">
                Our club is part of Rotary District 5320, which encompasses
                clubs throughout Southern California including Orange County,
                parts of Los Angeles County, and the Inland Empire. The district
                supports our local projects and connects us with neighboring
                clubs for greater impact.
              </p>
            </div>
            <div className="bg-navy-50 rounded-xl p-6">
              <h3 className="font-semibold text-navy-800 text-lg mb-3">
                Rotary International
              </h3>
              <p className="text-navy-600 leading-relaxed">
                Rotary International unites over 1.4 million members in 46,000+
                clubs across more than 200 countries and regions. Together, we
                tackle the world&apos;s most pressing challenges through seven
                areas of focus.
              </p>
              <a
                href="https://www.rotary.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-navy-700 font-medium hover:text-gold-600 transition-colors"
              >
                Visit rotary.org
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interested in Joining?
          </h2>
          <p className="text-navy-100 text-lg mb-8 max-w-2xl mx-auto">
            We&apos;re always looking for community-minded individuals who want
            to make a difference. Come to a meeting, get to know our members,
            and discover how Rotary can enrich your life while you serve others.
          </p>
          <Link
            href="/join"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Learn How to Join
          </Link>
        </div>
      </section>
    </main>
  );
}
