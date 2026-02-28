"use client";

import { useState } from "react";
import { Wine, CheckCircle, Loader2, Users, Star, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FormData = {
  businessName: string; contactName: string; email: string; phone: string;
  category: string; website: string; description: string; previousParticipant: boolean;
};

const INITIAL: FormData = {
  businessName: "", contactName: "", email: "", phone: "",
  category: "", website: "", description: "", previousParticipant: false,
};

const CATEGORIES = ["wine", "beer", "spirits", "food", "entertainment", "other"];
const PERKS = [
  { icon: Users, text: "Exposure to 350+ guests" },
  { icon: Star, text: "Premier event positioning" },
  { icon: MapPin, text: "Fullerton Family YMCA · Oct 17, 2026" },
];

const inp = "w-full px-4 py-2.5 rounded-lg border border-wine-200 bg-white text-wine-950 placeholder:text-wine-300 focus:outline-none focus:ring-2 focus:ring-wine-600/30 focus:border-wine-600 transition text-sm";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-wine-900 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function VendorInterestPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  function set(field: keyof FormData, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!form.contactName.trim()) e.contactName = "Contact name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required.";
    if (!form.category) e.category = "Please select a category.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/vendor-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: crypto.randomUUID(), ...form }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setStatus("success");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-wine-950 mb-3">Thank You!</h2>
          <p className="text-wine-700 leading-relaxed">
            We received your interest form for <span className="font-semibold">{form.businessName}</span>.
            Our team will be in touch soon with next steps for Fullerton Uncorked 2026.
          </p>
          <p className="mt-4 text-sm text-wine-500">October 17, 2026 · Fullerton Family YMCA</p>
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wine-950/5 border border-wine-200 text-wine-700 text-xs font-semibold tracking-widest uppercase mb-4">
          <Wine className="w-3.5 h-3.5" /> Fullerton Uncorked 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-wine-950 mb-3 tracking-tight">Vendor Interest Form</h1>
        <p className="text-wine-600 max-w-xl mx-auto leading-relaxed">
          Join us for an evening of fine wine, craft beer, and culinary excellence. Share your details and
          our team will reach out with participation information.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Form card */}
        <div className="bg-white rounded-2xl border border-wine-100 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Business Name *" error={errors.businessName}>
                <input type="text" className={cn(inp, errors.businessName && "border-red-400")}
                  value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Your business name" />
              </Field>
              <Field label="Contact Name *" error={errors.contactName}>
                <input type="text" className={cn(inp, errors.contactName && "border-red-400")}
                  value={form.contactName} onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Your full name" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Email *" error={errors.email}>
                <input type="email" className={cn(inp, errors.email && "border-red-400")}
                  value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com" />
              </Field>
              <Field label="Phone">
                <input type="text" className={inp} value={form.phone}
                  onChange={(e) => set("phone", e.target.value)} placeholder="(714) 555-0100" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Category *" error={errors.category}>
                <select className={cn(inp, "bg-white", errors.category && "border-red-400")}
                  value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Website">
                <input type="url" className={inp} value={form.website}
                  onChange={(e) => set("website", e.target.value)} placeholder="https://yourbusiness.com" />
              </Field>
            </div>

            <Field label="About Your Business">
              <textarea rows={4} className={cn(inp, "resize-none")} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell us about your business and what you'd offer at Fullerton Uncorked" />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 accent-wine-600 rounded"
                checked={form.previousParticipant} onChange={(e) => set("previousParticipant", e.target.checked)} />
              <span className="text-sm text-wine-800 group-hover:text-wine-950 transition-colors">
                We have participated in Fullerton Uncorked before
              </span>
            </label>

            {status === "error" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errMsg || "Submission failed. Please try again."}
              </div>
            )}

            <button type="submit" disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-wine-800 to-wine-600 text-white font-semibold text-sm shadow-md shadow-wine-900/20 hover:from-wine-700 hover:to-wine-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Interest Form"}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-wine-950 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-gold-400 text-xs tracking-widest uppercase mb-4">Why Participate?</h3>
            <ul className="space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-wine-200">
                  <Icon className="w-4 h-4 text-gold-400 shrink-0" /> {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cream-100 rounded-2xl p-5 border border-wine-100">
            <p className="text-xs font-semibold text-wine-700 uppercase tracking-widest mb-1.5">Questions?</p>
            <p className="text-sm text-wine-700">
              Email{" "}
              <a href="mailto:events@fullertonrotary.org" className="text-wine-600 underline underline-offset-2 hover:text-wine-800 transition-colors">
                events@fullertonrotary.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
