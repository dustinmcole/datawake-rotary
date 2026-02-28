"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Heart,
  Award,
  Globe,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Users,
    title: "Networking & Fellowship",
    description:
      "Connect with business and community leaders who share your commitment to making a difference.",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description:
      "Hands-on service projects that make a real difference in Fullerton and beyond.",
  },
  {
    icon: Award,
    title: "Leadership Development",
    description:
      "Develop skills through committee work, project management, and club leadership opportunities.",
  },
  {
    icon: Globe,
    title: "Global Connections",
    description:
      "Be part of 1.4 million Rotarians in 200+ countries working together for a better world.",
  },
];

const REFERRAL_OPTIONS = [
  "Current Member Referral",
  "Website",
  "Social Media",
  "Community Event",
  "Other",
];

const FAQ_ITEMS = [
  {
    question: "What does membership cost?",
    answer:
      "Annual dues are set by the club and cover meals, Rotary International dues, and district fees. Contact us for current rates.",
  },
  {
    question: "Do I need to be invited?",
    answer:
      "Rotary is an invite-based organization, but we welcome all inquiries. Submit the form above and our membership committee will reach out to discuss the process.",
  },
  {
    question: "What is the time commitment?",
    answer:
      "Weekly lunch meetings are held every Wednesday from 12:00\u20131:30 PM at Coyote Hills Country Club. Beyond meetings, members can participate in optional service projects, events, and committees.",
  },
  {
    question: "What is a classification?",
    answer:
      "Rotary uses professional classifications to ensure diverse representation across industries and professions. Examples include Banking, Education, Healthcare, Law, Real Estate, Technology, and many more.",
  },
];

export default function JoinPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    classification: "",
    referredBy: "",
    reason: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/membership-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone || null,
          company: form.company || null,
          classification: form.classification || null,
          referredBy: form.referredBy || null,
          reason: form.reason || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || `Something went wrong (${res.status})`
        );
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  }

  return (
    <div>
      {/* Page Header */}
      <section className="bg-navy-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-navy-200 text-sm font-medium uppercase tracking-wider mb-3">
            Rotary Club of Fullerton
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Fullerton Rotary
          </h1>
          <p className="text-navy-100 text-lg max-w-2xl mx-auto">
            Become part of our community of service-minded leaders making a
            difference in Fullerton and around the world.
          </p>
        </div>
      </section>

      {/* Why Join */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">
            Why Join Rotary?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-navy-50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-navy-800 text-lg mb-2">
                  {b.title}
                </h3>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ two-column */}
      <section className="bg-navy-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Inquiry Form — 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
                <h2 className="text-2xl font-bold text-navy-800 mb-2">
                  Membership Inquiry
                </h2>
                <p className="text-navy-600 mb-8">
                  Fill out the form below and our membership committee will be in
                  touch.
                </p>

                {status === "success" ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-navy-800 mb-2">
                      Thank You!
                    </h3>
                    <p className="text-navy-600 text-lg max-w-md mx-auto">
                      Your inquiry has been received. A member of our membership
                      committee will reach out to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={form.firstName}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder="Jane"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={form.lastName}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder="(714) 555-0100"
                        />
                      </div>
                    </div>

                    {/* Company + Classification */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          Company / Organization
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          value={form.company}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="classification"
                          className="block text-sm font-medium text-navy-700 mb-1.5"
                        >
                          Professional Classification
                        </label>
                        <input
                          id="classification"
                          name="classification"
                          type="text"
                          value={form.classification}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                          placeholder='e.g., "Attorney", "Education", "Healthcare"'
                        />
                      </div>
                    </div>

                    {/* Referral */}
                    <div>
                      <label
                        htmlFor="referredBy"
                        className="block text-sm font-medium text-navy-700 mb-1.5"
                      >
                        How did you hear about us?
                      </label>
                      <select
                        id="referredBy"
                        name="referredBy"
                        value={form.referredBy}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                      >
                        <option value="">Select an option</option>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reason */}
                    <div>
                      <label
                        htmlFor="reason"
                        className="block text-sm font-medium text-navy-700 mb-1.5"
                      >
                        Why are you interested in joining Rotary?
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={4}
                        value={form.reason}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition resize-none"
                        placeholder="Tell us a bit about yourself and what interests you about Rotary..."
                      />
                    </div>

                    {/* Error message */}
                    {status === "error" && (
                      <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-navy-900 font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* FAQ — 2 columns */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-navy-800 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-navy-100 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-navy-800 text-sm">
                        {faq.question}
                      </span>
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-navy-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-navy-500 shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4">
                        <p className="text-navy-600 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Extra info card */}
              <div className="mt-8 bg-navy-700 rounded-xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">
                  Visit a Meeting First
                </h3>
                <p className="text-navy-100 text-sm leading-relaxed mb-4">
                  The best way to learn about Rotary is to experience it.
                  Guests are always welcome at our weekly meetings — no
                  commitment required.
                </p>
                <div className="text-sm text-navy-200 space-y-1">
                  <p>
                    <strong className="text-white">When:</strong> Every
                    Wednesday, 12:00 &ndash; 1:30 PM
                  </p>
                  <p>
                    <strong className="text-white">Where:</strong> Coyote Hills
                    Country Club, Fullerton
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-block mt-4 text-gold-400 hover:text-gold-300 font-medium text-sm transition-colors"
                >
                  Get directions &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
