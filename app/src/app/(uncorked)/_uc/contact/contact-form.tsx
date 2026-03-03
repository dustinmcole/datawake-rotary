"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please email us directly at info@fullertonuncorked.org");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-wine-950 mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm">Thank you for reaching out. We&apos;ll get back to you within 1-2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-wine-900 mb-1.5">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-wine-400 focus:ring-2 focus:ring-wine-400/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-wine-900 mb-1.5">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-wine-400 focus:ring-2 focus:ring-wine-400/20 transition-all"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-semibold text-wine-900 mb-1.5">Subject</label>
        <select
          id="contact-subject"
          name="subject"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-wine-400 focus:ring-2 focus:ring-wine-400/20 transition-all bg-white"
        >
          <option value="">Select a topic...</option>
          <option value="tickets">Ticket Questions</option>
          <option value="sponsorship">Sponsorship Inquiry</option>
          <option value="vendor">Vendor / Exhibitor</option>
          <option value="volunteering">Volunteering</option>
          <option value="media">Media / Press</option>
          <option value="general">General Question</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-wine-900 mb-1.5">Message</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-wine-400 focus:ring-2 focus:ring-wine-400/20 transition-all resize-none"
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-900 text-white font-bold text-sm shadow-lg hover:from-wine-600 hover:to-wine-800 transition-all disabled:opacity-60"
      >
        <Send className="w-4 h-4" />
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
