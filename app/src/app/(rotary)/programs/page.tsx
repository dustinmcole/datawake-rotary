import type { Metadata } from "next";
import {
  Heart,
  Globe,
  GraduationCap,
  Briefcase,
  Award,
  Users,
  Star,
  Target,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programs & Service",
  description: "Explore Fullerton Rotary's community service, youth programs, international projects, vocational service, and The Rotary Foundation.",
  openGraph: {
    title: "Programs & Service | Fullerton Rotary Club",
    description: "Explore Fullerton Rotary's community service, youth programs, international projects, vocational service, and The Rotary Foundation.",
    url: "https://www.fullertonrotary.org/programs",
    siteName: "Fullerton Rotary Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programs & Service | Fullerton Rotary Club",
    description: "Explore Fullerton Rotary's community service, youth programs, international projects, vocational service, and The Rotary Foundation.",
  },
};

export default function ProgramsPage() {
  return (
    <main>
      {/* Page Header */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-navy-200 text-sm font-medium uppercase tracking-wider mb-3">
            Rotary Club of Fullerton
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Programs &amp; Service
          </h1>
          <p className="text-navy-100 text-lg">
            Making a difference locally, nationally, and around the world
          </p>
        </div>
      </section>

      {/* Community Service */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800">
                Community Service
              </h2>
              <p className="text-navy-500 font-medium mt-1">
                Strengthening Fullerton and beyond
              </p>
            </div>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed ml-16">
            <p>
              Our club leads and supports hands-on service projects that
              directly benefit Fullerton families, seniors, schools, and local
              nonprofits. Every year, our members contribute thousands of
              volunteer hours to improve the community we call home.
            </p>
            <p className="font-medium text-navy-800">
              Recent and ongoing projects include:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Holiday food drives for families in need",
                "Park cleanups and beautification projects",
                "Annual scholarships for Fullerton students",
                "Partnerships with Boys & Girls Club",
                "Support for Fullerton Interfaith Emergency Services (FIES)",
                "Collaboration with Pathways of Hope",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-gold-500 mt-1 flex-shrink-0" />
                  <span className="text-navy-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Youth Programs */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800">
                Youth Programs
              </h2>
              <p className="text-navy-500 font-medium mt-1">
                Investing in the next generation
              </p>
            </div>
          </div>
          <div className="grid gap-6 ml-16">
            {[
              {
                title: "Interact Club",
                icon: Users,
                description:
                  "A Rotary-sponsored service club for high school students. Interact members develop leadership skills, build lasting friendships, and discover the power of Service Above Self through hands-on community and international projects.",
              },
              {
                title: "Rotaract",
                icon: Briefcase,
                description:
                  "For young adults ages 18 to 30, Rotaract bridges the gap between youth programs and full Rotary membership. Members lead their own service projects, develop professional networks, and take on leadership roles that shape their careers and communities.",
              },
              {
                title: "Youth Exchange",
                icon: Globe,
                description:
                  "Rotary Youth Exchange sends and hosts high school students for long- and short-term stays abroad. Students gain cultural fluency, independence, and a global perspective that lasts a lifetime — while serving as ambassadors for peace and understanding.",
              },
              {
                title: "RYLA — Rotary Youth Leadership Awards",
                icon: Target,
                description:
                  "An intensive leadership camp that brings together outstanding young people for training in communication, conflict resolution, ethics, and community engagement. Our club sponsors students from Fullerton high schools each year.",
              },
              {
                title: "Scholarships",
                icon: BookOpen,
                description:
                  "Each year, the Rotary Club of Fullerton awards scholarships to graduating seniors and college students from the Fullerton community. Awards recognize academic achievement, community involvement, and commitment to service.",
              },
            ].map((program) => (
              <div
                key={program.title}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <program.icon className="w-5 h-5 text-navy-600" />
                  <h3 className="text-xl font-semibold text-navy-800">
                    {program.title}
                  </h3>
                </div>
                <p className="text-navy-600 leading-relaxed">
                  {program.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* International Service */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800">
                International Service
              </h2>
              <p className="text-navy-500 font-medium mt-1">
                Global impact through The Rotary Foundation
              </p>
            </div>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed ml-16">
            <p>
              Through The Rotary Foundation, our club participates in global
              projects that address critical humanitarian needs. Rotary&apos;s
              international reach allows even a single club to create meaningful
              change on the other side of the world.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  title: "PolioPlus",
                  description:
                    "Rotary has been leading the fight to eradicate polio since 1985. With our partners, we have reduced polio cases by 99.9% — and we won't stop until every child is safe.",
                },
                {
                  title: "Clean Water Projects",
                  description:
                    "Providing access to clean water, sanitation, and hygiene education in communities that need it most.",
                },
                {
                  title: "Disaster Relief",
                  description:
                    "When disasters strike, Rotarians respond with immediate relief and long-term recovery support through our global network.",
                },
                {
                  title: "Global Grants",
                  description:
                    "Large-scale, sustainable projects funded through Rotary Foundation Global Grants address systemic challenges in health, education, and economic development.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-navy-50 rounded-xl p-5"
                >
                  <h3 className="font-semibold text-navy-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-navy-600 text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vocational Service */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800">
                Vocational Service
              </h2>
              <p className="text-navy-500 font-medium mt-1">
                Ethics and excellence in every profession
              </p>
            </div>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed ml-16">
            <p>
              Vocational service is one of Rotary&apos;s founding pillars. We
              believe that every Rotarian has a responsibility to uphold the
              highest ethical standards in their profession and to use their
              skills to serve others.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  title: "Career Mentorship",
                  description:
                    "Connecting experienced professionals with students and young adults to provide guidance, networking, and real-world insight.",
                },
                {
                  title: "Ethics Day",
                  description:
                    "An annual program at local high schools where Rotarians lead interactive workshops on ethical decision-making in careers and daily life.",
                },
                {
                  title: "Vocational Training Grants",
                  description:
                    "Funding hands-on training and professional development in underserved communities, both locally and internationally.",
                },
                {
                  title: "Classification Talks",
                  description:
                    "At our weekly meetings, members share their professional expertise and career journeys, fostering mutual respect and understanding across vocations.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-navy-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-navy-600 text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Rotary Foundation */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-800">
                The Rotary Foundation
              </h2>
              <p className="text-navy-500 font-medium mt-1">
                Doing Good in the World
              </p>
            </div>
          </div>
          <div className="space-y-4 text-navy-700 text-lg leading-relaxed ml-16">
            <p>
              The Rotary Foundation is one of the world&apos;s largest and most
              effective private foundations, consistently earning top ratings for
              financial transparency and impact. Every dollar contributed by our
              members funds projects that change lives — from eradicating polio
              to providing clean water, educating children, and growing local
              economies.
            </p>
            <div className="bg-navy-50 rounded-xl p-6 mt-6">
              <h3 className="font-semibold text-navy-800 text-lg mb-4">
                How Our Club Contributes
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    label: "Annual Fund",
                    text: "Our club contributes annually to the Rotary Foundation's World Fund, which finances grants and programs globally.",
                  },
                  {
                    label: "Paul Harris Fellows",
                    text: "Members and community leaders who contribute or have contributions made in their name of $1,000+ are recognized as Paul Harris Fellows — one of Rotary's highest honors.",
                  },
                  {
                    label: "PolioPlus",
                    text: "Dedicated contributions toward the global campaign to end polio, with every Rotary dollar matched 2:1 by the Bill & Melinda Gates Foundation.",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-gold-500 mt-1.5 flex-shrink-0" />
                    <p className="text-navy-600">
                      <span className="font-semibold text-navy-800">
                        {item.label}:
                      </span>{" "}
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get Involved</h2>
          <p className="text-navy-100 text-lg mb-8 max-w-2xl mx-auto">
            Whether you want to volunteer on a service project, mentor a
            student, or become a Rotary member, there&apos;s a place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Join Our Club
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
