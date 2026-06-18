"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { DataTable } from "./DataTable";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import type { PortfolioItem } from "@/types/db";

const categoryOpts = [
  { value: "web",      label: "Web Development" },
  { value: "design",   label: "UI/UX Design" },
  { value: "mobile",   label: "Mobile App" },
  { value: "branding", label: "Branding" },
  { value: "seo",      label: "SEO" },
  { value: "other",    label: "Other" },
];
const boolOpts = [{ value: "1", label: "Yes" }, { value: "0", label: "No" }];

const empty = { slug: "", title: "", client: "", category: "web", summary: "", description: "", cover_url: "", live_url: "", github_url: "", year: String(new Date().getFullYear()), tags: "", featured: "0", is_published: "1", sort_order: "0" };

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function PortfolioManager() {
  const [items, setItems]     = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [deleting, setDeleting] = useState<PortfolioItem | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(empty);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/portfolio").then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (p: PortfolioItem) => {
    setEditing(p);
    const tags = (() => { try { return (JSON.parse(p.tags) as string[]).join(", "); } catch { return ""; } })();
    setForm({
      slug: p.slug, title: p.title, client: p.client, category: p.category,
      summary: p.summary, description: p.description, cover_url: p.cover_url,
      live_url: p.live_url ?? "", github_url: p.github_url ?? "",
      year: String(p.year ?? ""), tags,
      featured: String(p.featured), is_published: String(p.is_published),
      sort_order: String(p.sort_order),
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const body = {
        ...form, tags,
        gallery_urls: [],
        year:         form.year ? Number(form.year) : null,
        featured:     Number(form.featured),
        is_published: Number(form.is_published),
        sort_order:   Number(form.sort_order),
        live_url:     form.live_url   || null,
        github_url:   form.github_url || null,
      };
      const url    = editing ? `/api/admin/portfolio/${editing.id}` : "/api/admin/portfolio";
      const method = editing ? "PUT" : "POST";
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true);
    try { await fetch(`/api/admin/portfolio/${deleting.id}`, { method: "DELETE" }); setDeleting(null); load(); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: "title", header: "Project", sortable: true,
      render: (p: PortfolioItem) => (
        <div className="flex items-center gap-3">
          {p.cover_url ? (
            <span style={{ backgroundImage: `url(${p.cover_url})` }} className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0 block" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-gray-600" /></div>
          )}
          <div>
            <div className="text-white font-medium text-sm">{p.title}</div>
            <div className="text-gray-500 text-xs">{p.client}</div>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true, render: (p: PortfolioItem) => <span className="text-gray-400 text-xs capitalize">{p.category}</span> },
    { key: "year", header: "Year", render: (p: PortfolioItem) => <span className="text-gray-500 text-xs">{p.year ?? "—"}</span> },
    { key: "featured", header: "Featured", render: (p: PortfolioItem) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.featured ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-500"}`}>
        {p.featured ? "Featured" : "Normal"}
      </span>
    )},
    { key: "is_published", header: "Status", render: (p: PortfolioItem) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.is_published ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
        {p.is_published ? "Published" : "Draft"}
      </span>
    )},
    { key: "live_url", header: "Link", render: (p: PortfolioItem) => p.live_url ? (
      <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ) : <span className="text-gray-600">—</span> },
    { key: "actions", header: "", render: (p: PortfolioItem) => (
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => setDeleting(p)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Portfolio</h1>
          <p className="text-gray-500 text-sm">{items.length} projects</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Add Project</Button>
      </div>

      <div className="glass rounded-2xl border border-white/[0.07] p-5">
        <DataTable data={items} columns={columns} searchKeys={["title", "client", "category"]} loading={loading} emptyMessage="No portfolio items yet." />
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <m.div className="glass-strong rounded-2xl p-7 w-full max-w-lg border border-white/15 shadow-glass-lg my-8"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">{editing ? "Edit Project" : "Add Portfolio Project"}</h2>
                  </div>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Project Title" value={form.title} onChange={e => { set("title", e.target.value); if (!editing) set("slug", toSlug(e.target.value)); }} required placeholder="My Awesome Project" />
                      <Input label="Slug (URL)" value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} required placeholder="my-awesome-project" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Client Name" value={form.client} onChange={e => set("client", e.target.value)} required placeholder="Client Co." />
                      <Select label="Category" options={categoryOpts} value={form.category} onChange={e => set("category", e.target.value)} />
                    </div>
                    <Input label="Cover Image URL" value={form.cover_url} onChange={e => set("cover_url", e.target.value)} required placeholder="https://cdn.thewebstart.in/..." />
                    <Input label="Summary (one line)" value={form.summary} onChange={e => set("summary", e.target.value)} required placeholder="A brief one-line summary" />
                    <Textarea label="Full Description" value={form.description} onChange={e => set("description", e.target.value)} required rows={3} placeholder="Detailed description of the project..." />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Live URL" value={form.live_url} onChange={e => set("live_url", e.target.value)} placeholder="https://example.com" />
                      <Input label="GitHub URL" value={form.github_url} onChange={e => set("github_url", e.target.value)} placeholder="https://github.com/..." />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Year" type="number" value={form.year} onChange={e => set("year", e.target.value)} placeholder="2025" />
                      <Select label="Featured?" options={boolOpts} value={form.featured} onChange={e => set("featured", e.target.value)} />
                      <Select label="Published?" options={boolOpts} value={form.is_published} onChange={e => set("is_published", e.target.value)} />
                    </div>
                    <Input label="Tags (comma separated)" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Next.js, React, Tailwind" />
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                      <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? "Save Changes" : "Add Project"}</Button>
                    </div>
                  </form>
                </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleting} title="Delete Project" message={`Delete "${deleting?.title}" from portfolio?`}
        confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={saving} />
    </div>
  );
}
