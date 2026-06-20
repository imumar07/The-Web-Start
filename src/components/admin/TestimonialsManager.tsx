"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { DataTable } from "./DataTable";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import type { Testimonial } from "@/types/db";

const ratingOpts = [5,4,3,2,1].map(n => ({ value: String(n), label: "★".repeat(n) + " " + n }));
const serviceOpts = [
  { value: "", label: "None" },
  { value: "full-stack-development", label: "Full-Stack Development" },
  { value: "wordpress-development",  label: "WordPress Development" },
  { value: "ui-ux-design",           label: "UI/UX Design" },
  { value: "seo",                    label: "SEO" },
  { value: "social-media-marketing", label: "Social Media Marketing" },
  { value: "branding",               label: "Branding" },
];
const activeOpts = [{ value: "1", label: "Active" }, { value: "0", label: "Hidden" }];

const empty = { author_name: "", author_role: "", company: "", avatar_url: "", content: "", rating: "5", service_tag: "", is_active: "1", sort_order: "0" };

export function TestimonialsManager() {
  const [items, setItems]     = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(empty);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/testimonials").then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      author_name: t.author_name, author_role: t.author_role,
      company: t.company ?? "", avatar_url: t.avatar_url ?? "",
      content: t.content, rating: String(t.rating),
      service_tag: t.service_tag ?? "", is_active: String(t.is_active),
      sort_order: String(t.sort_order),
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...form, rating: Number(form.rating), is_active: Number(form.is_active), sort_order: Number(form.sort_order), company: form.company || null, avatar_url: form.avatar_url || null, service_tag: form.service_tag || null };
      const url    = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true);
    try { await fetch(`/api/admin/testimonials/${deleting.id}`, { method: "DELETE" }); setDeleting(null); load(); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: "author_name", header: "Author", sortable: true,
      render: (t: Testimonial) => (
        <div>
          <div className="text-white font-medium text-sm">{t.author_name}</div>
          <div className="text-gray-500 text-xs">{t.author_role}{t.company ? ` · ${t.company}` : ""}</div>
        </div>
      ),
    },
    { key: "rating", header: "Rating", render: (t: Testimonial) => <span className="text-yellow-400 text-sm">{"★".repeat(t.rating)}</span> },
    { key: "service_tag", header: "Service", render: (t: Testimonial) => <span className="text-gray-400 text-xs">{t.service_tag ?? "—"}</span> },
    { key: "content", header: "Review", render: (t: Testimonial) => <span className="text-gray-400 text-xs line-clamp-2 max-w-xs">{t.content}</span> },
    { key: "is_active", header: "Status", render: (t: Testimonial) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
        {t.is_active ? "Active" : "Hidden"}
      </span>
    )},
    { key: "actions", header: "", render: (t: Testimonial) => (
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => openEdit(t)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => setDeleting(t)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Testimonials</h1>
          <p className="text-gray-500 text-sm">{items.length} testimonials</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Add Testimonial</Button>
      </div>

      <div className="glass rounded-2xl border border-white/[0.07] p-5">
        <DataTable data={items} columns={columns} searchKeys={["author_name", "company", "content"]} loading={loading} emptyMessage="No testimonials yet." />
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[51] overflow-y-auto overscroll-contain touch-pan-y">
              <div className="flex min-h-full items-center justify-center p-4">
                <m.div className="glass-strong rounded-2xl p-7 w-full max-w-lg border border-white/15 shadow-glass-lg my-8 max-h-[90vh] overflow-y-auto overscroll-contain"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-yellow-500/15 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">{editing ? "Edit Testimonial" : "Add Testimonial"}</h2>
                  </div>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Author Name" value={form.author_name} onChange={e => set("author_name", e.target.value)} required placeholder="John Smith" />
                      <Input label="Role / Title" value={form.author_role} onChange={e => set("author_role", e.target.value)} required placeholder="CEO" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Company" value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Inc." />
                      <Select label="Rating" options={ratingOpts} value={form.rating} onChange={e => set("rating", e.target.value)} />
                    </div>
                    <Input label="Avatar URL (optional)" value={form.avatar_url} onChange={e => set("avatar_url", e.target.value)} placeholder="https://..." />
                    <Textarea label="Review Content" value={form.content} onChange={e => set("content", e.target.value)} required rows={4} placeholder="Write the testimonial here..." />
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Service Tag" options={serviceOpts} value={form.service_tag} onChange={e => set("service_tag", e.target.value)} />
                      <Select label="Status" options={activeOpts} value={form.is_active} onChange={e => set("is_active", e.target.value)} />
                    </div>
                    <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} placeholder="0" />
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                      <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? "Save Changes" : "Add Testimonial"}</Button>
                    </div>
                  </form>
                </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleting} title="Delete Testimonial" message={`Delete testimonial from "${deleting?.author_name}"?`}
        confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={saving} />
    </div>
  );
}
