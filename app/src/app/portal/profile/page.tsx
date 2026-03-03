"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { UserCircle, Save, Loader2, CheckCircle2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  classification: string;
  bio: string;
  address: string;
  photoUrl: string | null;
  memberType: string;
  memberSince: string | null;
  roles: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [classification, setClassification] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    // Fetch current user's profile via /api/members with own ID
    // The members endpoint uses the Clerk userId to scope access
    fetch("/api/members/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
          setPhone(data.phone ?? "");
          setCompany(data.company ?? "");
          setClassification(data.classification ?? "");
          setBio(data.bio ?? "");
          setAddress(data.address ?? "");
          setPhotoUrl(data.photoUrl ?? "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/members/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, company, classification, bio, address, photoUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile");
        return;
      }
      const updated = await res.json();
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const initials = profile
    ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  const roles: string[] = profile
    ? (() => {
        try {
          return JSON.parse(profile.roles);
        } catch (error) {
          console.error('Operation failed:', error);
          toast.error('Something went wrong. Please try again.');
          return ["member"];
        }
      })()
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gray-200" />
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-5">
              <div className="h-3.5 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Member profile not found</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Profile not set up yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your profile will appear here once your account is fully configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
          <UserCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">View and update your member information</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Avatar banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-24 relative" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-6">
              <Avatar.Root className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <Avatar.Image
                  src={photoUrl || undefined}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <ReadOnlyField label="Member Type" value={profile.memberType} />
              <ReadOnlyField
                label="Member Since"
                value={
                  profile.memberSince
                    ? new Date(profile.memberSince).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <ReadOnlyField
                label="Role"
                value={roles
                  .map((r) => r.replace(/_/g, " "))
                  .join(", ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              />
            </div>

            {/* Editable fields */}
            <div className="space-y-5">
              <Field
                label="Photo URL"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={setPhotoUrl}
                hint="Link to your profile photo"
                icon={<Camera className="w-4 h-4 text-gray-400" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Phone"
                  placeholder="(714) 555-0100"
                  value={phone}
                  onChange={setPhone}
                />
                <Field
                  label="Company / Employer"
                  placeholder="Acme Corp"
                  value={company}
                  onChange={setCompany}
                />
              </div>
              <Field
                label="Classification"
                placeholder="e.g., Attorney, Real Estate, Technology"
                value={classification}
                onChange={setClassification}
                hint="Your professional classification within Rotary"
              />
              <Field
                label="Address"
                placeholder="123 Main St, Fullerton, CA 92832"
                value={address}
                onChange={setAddress}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio about yourself…"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
          {saved && (
            <p className="text-sm text-green-600 font-medium">Profile updated successfully.</p>
          )}
        </div>
      </form>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-700">{value || "—"}</p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  hint,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-gray-200 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm",
            icon ? "pl-9 pr-3" : "px-3"
          )}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
