"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";

export function CreateCollectorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ url: "", description: "", name: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/api/collectors/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.message || data.error || "Request submitted.");
      if (res.ok) {
        setTimeout(() => setIsOpen(false), 3000);
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-on-surface text-background font-bold text-sm tracking-wide uppercase font-mono rounded hover:bg-on-surface/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Scraper
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <BentoCard className="w-full max-w-lg p-6 relative border-2 border-on-surface/20">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-on-surface/50 hover:text-on-surface"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Build New Scraper</h2>
            <p className="text-on-surface/70 mb-6">Provide a URL and describe what you want to extract.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold font-mono text-on-surface/80 mb-1">Target URL</label>
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-background border-2 border-on-surface/20 px-3 py-2 text-on-surface rounded focus:border-on-surface outline-none transition-colors"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold font-mono text-on-surface/80 mb-1">Scraper Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. HackerNews Top Stories"
                  className="w-full bg-background border-2 border-on-surface/20 px-3 py-2 text-on-surface rounded focus:border-on-surface outline-none transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold font-mono text-on-surface/80 mb-1">Extraction Prompt</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Extract the title, url, points, author, and comment count for each story."
                  className="w-full bg-background border-2 border-on-surface/20 px-3 py-2 text-on-surface rounded focus:border-on-surface outline-none transition-colors"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {message && (
                <div className="p-3 bg-surface-low border-l-4 border-on-surface/40 text-sm font-mono text-on-surface/80">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-on-surface text-background font-bold px-4 py-3 uppercase tracking-widest font-mono rounded hover:bg-on-surface/90 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate Scraper'}
              </button>
            </form>
          </BentoCard>
        </div>
      )}
    </>
  );
}
