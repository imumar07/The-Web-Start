"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { DataTable } from "./DataTable";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import type { BlogPost } from "@/types/db";

const pubOpts = [{ value: "0", label: "Draft" }, { value: "1", label: "Published" }];

const empty = { slug: "", title: "", excerpt: "", cover_url: "", tags: "", author: "The Web Start", mdx_content: "", reading_time: "", is_published: "0", meta_title: "", meta_desc: "" };

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function BlogManager() {
  const [items, setItems]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(empty);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/blog").then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    const tags = (() => { try { return (JSON.parse(p.tags) as string[]).join(", "); } catch { return ""; } })();
    setForm({
      slug: p.slug, title: p.title, excerpt: p.excerpt,
      cover_url: p.cover_url ?? "", tags,
      author: p.author, mdx_content: p.mdx_content,
      reading_time: String(p.reading_time ?? ""),
      is_published: String(p.is_published),
      meta_title: p.meta_title ?? "", meta_desc: p.meta_desc ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const body = {
        ...form, tags,
        cover_url:    form.cover_url    || null,
        reading_time: form.reading_time ? Number(form.reading_time) : null,
        is_published: Number(form.is_published),
        meta_title:   form.meta_title   || null,
        meta_desc:    form.meta_desc    || null,
      };
      const url    = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
      const method = editing ? "PUT" : "POST";
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true);
    try { await fetch(`/api/admin/blog/${deleting.id}`, { method: "DELETE" }); setDeleting(null); load(); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: "title", header: "Title", sortable: true,
      render: (p: BlogPost) => (
        <div>
          <div className="text-white font-medium text-sm">{p.title}</div>
          <div className="text-gray-500 text-xs font-mono">/blog/{p.slug}</div>
        </div>
      ),
    },
    { key: "author", header: "Author", render: (p: BlogPost) => <span className="text-gray-400 text-sm">{p.author}</span> },
    { key: "reading_time", header: "Read", render: (p: BlogPost) => <span className="text-gray-500 text-xs">{p.reading_time ? `${p.reading_time} min` : "—"}</span> },
    { key: "is_published", header: "Status", render: (p: BlogPost) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.is_published ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}`}>
        {p.is_published ? "Published" : "Draft"}
      </span>
    )},
    { key: "published_at", header: "Published", render: (p: BlogPost) => <span className="text-gray-500 text-xs">{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</span> },
    { key: "actions", header: "", render: (p: BlogPost) => (
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
          <h1 className="font-display font-bold text-2xl text-white mb-1">Blog</h1>
          <p className="text-gray-500 text-sm">{items.length} posts</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>New Post</Button>
      </div>

      <div className="glass rounded-2xl border border-white/[0.07] p-5">
        <DataTable data={items} columns={columns} searchKeys={["title", "author", "excerpt"]} loading={loading} emptyMessage="No blog posts yet." />
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[51] overflow-y-auto overscroll-contain touch-pan-y">
              <div className="flex min-h-full items-center justify-center p-4">
                <m.div className="glass-strong rounded-2xl p-7 w-full max-w-2xl border border-white/15 shadow-glass-lg my-8 max-h-[90vh] overflow-y-auto overscroll-contain"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">{editing ? "Edit Post" : "New Blog Post"}</h2>
                  </div>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Title" value={form.title} onChange={e => { set("title", e.target.value); if (!editing) set("slug", toSlug(e.target.value)); }} required placeholder="Post Title" />
                      <Input label="Slug" value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} required placeholder="post-title" />
                    </div>
                    <Textarea label="Excerpt" value={form.excerpt} onChange={e => set("excerpt", e.target.value)} required rows={2} placeholder="Short summary shown in listings..." />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Cover Image URL" value={form.cover_url} onChange={e => set("cover_url", e.target.value)} placeholder="https://cdn.thewebstart.in/..." />
                      <Input label="Author" value={form.author} onChange={e => set("author", e.target.value)} placeholder="The Web Start" />
                    </div>
                    <Textarea label="Content (Markdown)" value={form.mdx_content} onChange={e => set("mdx_content", e.target.value)} required rows={10} placeholder="Write your blog post in Markdown..." />
                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Reading Time (min)" type="number" value={form.reading_time} onChange={e => set("reading_time", e.target.value)} placeholder="5" />
                      <Input label="Tags (comma separated)" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Next.js, React" />
                      <Select label="Status" options={pubOpts} value={form.is_published} onChange={e => set("is_published", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Meta Title" value={form.meta_title} onChange={e => set("meta_title", e.target.value)} placeholder="SEO title" />
                      <Input label="Meta Description" value={form.meta_desc} onChange={e => set("meta_desc", e.target.value)} placeholder="SEO description" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                      <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? "Save Changes" : "Publish Post"}</Button>
                    </div>
                  </form>
                </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleting} title="Delete Post" message={`Delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={saving} />
    </div>
  );
}
