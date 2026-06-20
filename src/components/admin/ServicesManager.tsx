"use client";
import { useEffect, useState } from "react";
import { Pencil, Briefcase, ToggleLeft, ToggleRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Service } from "@/types/db";

export function ServicesManager() {
  const [items, setItems]     = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ title: "", tagline: "", description: "", icon_name: "", sort_order: "0" });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/services").then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, tagline: s.tagline, description: s.description, icon_name: s.icon_name, sort_order: String(s.sort_order) });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!editing) return;
      const body = { ...form, sort_order: Number(form.sort_order) };
      const res  = await fetch(`/api/admin/services/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const toggleActive = async (s: Service) => {
    setToggling(s.id);
    try {
      await fetch(`/api/admin/services/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: s.is_active ? 0 : 1 }) });
      load();
    } finally { setToggling(null); }
  };

  if (loading) return (
    <div>
      <div className="mb-8"><h1 className="font-display font-bold text-2xl text-white mb-1">Services</h1></div>
      <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 glass rounded-2xl border border-white/[0.07] animate-pulse" />)}</div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Services</h1>
        <p className="text-gray-500 text-sm">Manage services shown on your homepage and services page</p>
      </div>

      <div className="space-y-3">
        {items.map(s => (
          <div key={s.id} className="glass rounded-2xl border border-white/[0.07] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed22,#06b6d422)", border: "1px solid #7c3aed33" }}>
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm">{s.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                  {s.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-0.5">{s.tagline}</p>
              <p className="text-gray-600 text-xs line-clamp-2">{s.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleActive(s)}
                disabled={toggling === s.id}
                className="p-1.5 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                title={s.is_active ? "Hide service" : "Show service"}
              >
                {s.is_active
                  ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                  : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => openEdit(s)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && editing && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[51] overflow-y-auto overscroll-contain touch-pan-y">
              <div className="flex min-h-full items-center justify-center p-4">
                <m.div className="glass-strong rounded-2xl p-7 w-full max-w-lg border border-white/15 shadow-glass-lg my-8 max-h-[90vh] overflow-y-auto overscroll-contain"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">Edit Service</h2>
                  </div>
                  <form onSubmit={handleSave} className="space-y-4">
                    <Input label="Service Title" value={form.title} onChange={e => set("title", e.target.value)} required />
                    <Input label="Tagline" value={form.tagline} onChange={e => set("tagline", e.target.value)} required placeholder="Short catchy tagline" />
                    <Textarea label="Description" value={form.description} onChange={e => set("description", e.target.value)} required rows={3} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Icon Name (Lucide)" value={form.icon_name} onChange={e => set("icon_name", e.target.value)} placeholder="Code2, Globe, Palette…" />
                      <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                      <Button type="submit" loading={saving} className="flex-1 justify-center">Save Changes</Button>
                    </div>
                  </form>
                </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog open={false} title="" message="" confirmLabel="OK" onConfirm={() => {}} onCancel={() => {}} />
    </div>
  );
}
