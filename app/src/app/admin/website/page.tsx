"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Globe,
  FileText,
  Save,
  Eye,
  EyeOff,
  History,
  RotateCcw,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  published: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

interface PageVersion {
  id: string;
  pageId: string;
  content: string;
  version: number;
  editedBy: string | null;
  createdAt: string;
}

type View = "list" | "edit" | "versions";

/** Simple markdown-to-React preview (admin-only, no raw HTML injection) */
function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-gray-900">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-900">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 text-gray-700 text-sm">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="text-gray-700 text-sm mb-2">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div className="p-6 min-h-[400px]">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Split on bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function WebsiteCmsPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [view, setView] = useState<View>("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [preview, setPreview] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMeta, setEditMeta] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openEditor = (page: Page) => {
    setSelectedPage(page);
    setEditTitle(page.title);
    setEditContent(page.content);
    setEditMeta(page.metaDescription);
    setEditPublished(page.published);
    setView("edit");
    setSaveStatus("idle");
    setPreview(false);
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch(`/api/pages/${selectedPage.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          metaDescription: editMeta,
          published: editPublished,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedPage(updated);
        setSaveStatus("success");
        fetchPages();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Something went wrong. Please try again.');
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const openVersions = async (page: Page) => {
    setSelectedPage(page);
    setView("versions");

    try {
      const res = await fetch(`/api/pages/${page.slug}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      console.error("Failed to fetch versions:", err);
    }
  };

  const restoreVersion = async (version: PageVersion) => {
    if (!selectedPage) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/pages/${selectedPage.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: version.content }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedPage(updated);
        fetchPages();
        openEditor(updated);
      }
    } catch (err) {
      console.error("Failed to restore version:", err);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    setView("list");
    setSelectedPage(null);
    setPreview(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website CMS</h1>
          <p className="text-sm text-gray-500">Manage public website content and pages</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
          Loading pages...
        </div>
      </div>
    );
  }

  // Version history view
  if (view === "versions" && selectedPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
            <p className="text-sm text-gray-500">
              {selectedPage.title} &middot; Current version: {selectedPage.version}
            </p>
          </div>
        </div>

        {versions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
            <History className="mx-auto mb-3 h-8 w-8" />
            No previous versions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">Version {v.version}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {v.content.length} characters
                  </p>
                </div>
                <button
                  onClick={() => restoreVersion(v)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Editor view
  if (view === "edit" && selectedPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
              <p className="text-sm text-gray-500">
                /{selectedPage.slug} &middot; Version {selectedPage.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/${selectedPage.slug === "home" ? "" : selectedPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Live
            </a>
            <button
              onClick={() => openVersions(selectedPage)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                saveStatus === "success"
                  ? "bg-green-600 text-white"
                  : saveStatus === "error"
                  ? "bg-red-600 text-white"
                  : "bg-amber-500 text-white hover:bg-amber-600",
                "disabled:opacity-50"
              )}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveStatus === "success" ? (
                <Check className="w-3.5 h-3.5" />
              ) : saveStatus === "error" ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving..." : saveStatus === "success" ? "Saved" : saveStatus === "error" ? "Error" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={selectedPage.slug}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={editMeta}
                  onChange={(e) => setEditMeta(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{editMeta.length}/160 characters</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Published</span>
                <button
                  onClick={() => setEditPublished(!editPublished)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    editPublished ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      editPublished ? "left-5.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Content editor */}
          <div className="xl:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                <span className="text-sm font-medium text-gray-600">Content (Markdown)</span>
                <button
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {preview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {preview ? (
                <MarkdownPreview content={editContent} />
              ) : (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y min-h-[400px]"
                  placeholder="Enter page content in Markdown format..."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page list view (default)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website CMS</h1>
        <p className="text-sm text-gray-500">
          Manage public website content and pages. Edit content here or let Bryn update pages via the API.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          <Globe className="mx-auto mb-3 h-10 w-10" />
          <p className="mb-2">No pages found.</p>
          <p className="text-sm">Run the seed script to populate initial page content.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-500">
                    /{page.slug === "home" ? "" : page.slug}
                    <span className="mx-2">&middot;</span>
                    v{page.version}
                    <span className="mx-2">&middot;</span>
                    {page.published ? (
                      <span className="text-green-600">Published</span>
                    ) : (
                      <span className="text-gray-400">Draft</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openVersions(page)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Version history"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditor(page)}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
