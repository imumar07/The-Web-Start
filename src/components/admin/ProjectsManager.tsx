"use client";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, LayoutGrid, List, Calendar } from "lucide-react";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import type { ProjectWithClient } from "@/types/dashboard";

const STATUSES = ["inquiry","proposal","active","review","completed","paused","cancelled"];
const SERVICE_OPTS = [
  { value: "full-stack-development", label: "Full-Stack Development" },
  { value: "wordpress-development",  label: "WordPress Development" },
  { value: "ui-ux-design",           label: "UI/UX Design" },
  { value: "seo",                    label: "SEO" },
  { value: "social-media-marketing", label: "Social Media Marketing" },
  { value: "branding",               label: "Branding" },
];
const PRIORITY_OPTS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const STATUS_OPTS = STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

type View = "list" | "kanban";

const KANBAN_COLS = [
  { id: "inquiry",   label: "Inquiry",   color: "#6b7280" },
  { id: "proposal",  label: "Proposal",  color: "#3b82f6" },
  { id: "active",    label: "Active",    color: "#10b981" },
  { id: "review",    label: "Review",    color: "#f59e0b" },
  { id: "completed", label: "Done",      color: "#7c3aed" },
];

const emptyForm = { client_id: "", title: "", description: "", service_type: "full-stack-development", status: "inquiry", priority: "medium", due_date: "", budget: "", notes: "", client_notes: "" };

export function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProjectWithClient | null>(null);
  const [deleting, setDeleting] = useState<ProjectWithClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/projects").then(r => r.json()),
      fetch("/api/admin/clients").then(r => r.json()),
    ]).then(([pd, cd]) => {
      if (pd.success) setProjects(pd.data);
      if (cd.success) setClients(cd.data.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })));
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: ProjectWithClient) => {
    setEditing(p);
    setForm({ client_id: String(p.client_id), title: p.title, description: p.description ?? "", service_type: p.service_type, status: p.status, priority: p.priority, due_date: p.due_date ?? "", budget: String(p.budget ?? ""), notes: p.notes ?? "", client_notes: p.client_notes ?? "" });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, client_id: Number(form.client_id), budget: form.budget ? Number(form.budget) : undefined };
      const url = editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if ((await res.json()).success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/projects/${deleting.id}`, { method: "DELETE" });
      setDeleting(null); load();
    } finally { setSaving(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status: status as ProjectWithClient["status"] } : p));
    await fetch(`/api/admin/projects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  };

  const clientOpts = [{ value: "", label: "Select client..." }, ...clients.map(c => ({ value: String(c.id), label: c.name }))];

  const columns = [
    { key: "title", header: "Project", sortable: true, render: (p: ProjectWithClient) => (
      <div>
        <div className="text-white font-medium text-sm">{p.title}</div>
        <div className="text-gray-500 text-xs">{p.client_name}</div>
      </div>
    )},
    { key: "service_type", header: "Service", render: (p: ProjectWithClient) => <span className="text-gray-400 text-xs">{p.service_type.replace(/-/g," ")}</span> },
    { key: "status", header: "Status", render: (p: ProjectWithClient) => <StatusBadge status={p.status} /> },
    { key: "priority", header: "Priority", render: (p: ProjectWithClient) => <StatusBadge status={p.priority} /> },
    { key: "progress", header: "Progress", render: (p: ProjectWithClient) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: "linear-gradient(90deg,#7c3aed,#06b6d4)" }} />
        </div>
        <span className="text-gray-400 text-xs w-8">{p.progress}%</span>
      </div>
    )},
    { key: "due_date", header: "Due", render: (p: ProjectWithClient) => <span className="text-gray-500 text-xs">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</span> },
    { key: "actions", header: "", render: (p: ProjectWithClient) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => setDeleting(p)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Projects</h1>
          <p className="text-gray-500 text-sm">{projects.length} total projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl p-1 flex gap-1">
            {([["kanban", LayoutGrid], ["list", List]] as [View, typeof LayoutGrid][]).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="p-2 rounded-lg transition-all duration-200"
                style={view === v ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "white" } : { color: "#6b7280" }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>New Project</Button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLS.map(col => {
              const colProjects = projects.filter(p => p.status === col.id);
              return (
                <div key={col.id} className="w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{col.label}</span>
                    <span className="ml-auto text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{colProjects.length}</span>
                  </div>
                  <div className="space-y-3 min-h-32">
                    {colProjects.map(p => (
                      <m.div key={p.id} layout className="glass rounded-xl p-4 border border-white/[0.07] hover:border-white/15 transition-all cursor-pointer group"
                        whileHover={{ scale: 1.01 }}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-gray-600">{p.client_name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(p)} className="p-1 text-gray-500 hover:text-white"><Pencil className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <p className="text-white text-sm font-medium mb-3 leading-snug">{p.title}</p>
                        <div className="h-1 bg-white/10 rounded-full mb-2">
                          <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: col.color }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-xs">{p.progress}% done</span>
                          {p.due_date && <span className="text-gray-600 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.due_date).toLocaleDateString()}</span>}
                        </div>
                        {/* Quick status change */}
                        <select className="mt-3 w-full text-xs glass rounded-lg px-2 py-1.5 text-gray-400 border border-white/10 bg-transparent cursor-pointer"
                          value={p.status} onChange={e => updateStatus(p.id, e.target.value)}>
                          {STATUSES.map(s => <option key={s} value={s} className="bg-[#08081a]">{s}</option>)}
                        </select>
                      </m.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="glass rounded-2xl border border-white/[0.07] p-5">
          <DataTable
            data={projects}
            columns={columns}
            searchKeys={["title", "client_name"]}
            loading={loading}
          />
        </div>
      )}

      {/* Project Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[51] overflow-y-auto overscroll-contain touch-pan-y">
              <div className="flex min-h-full items-center justify-center p-4">
              <m.div className="glass-strong rounded-2xl p-7 w-full max-w-4xl border border-white/15 shadow-glass-lg my-8 max-h-[90vh] overflow-y-auto overscroll-contain"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                <h2 className="font-display font-bold text-white text-lg mb-6">
                  {editing ? "Edit Project" : "New Project"}
                </h2>
                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* Left column */}
                    <div className="space-y-4">
                      {!editing && <Select label="Client" options={clientOpts} value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} required />}
                      <Input label="Project Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                      <Select label="Service" options={SERVICE_OPTS} value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} />
                      <Select label="Status" options={STATUS_OPTS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
                      <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                    </div>
                    {/* Right column */}
                    <div className="space-y-4">
                      <Select label="Priority" options={PRIORITY_OPTS} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
                      <Input label="Budget (₹)" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                      <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                      <Textarea label="Client-visible Notes" value={form.client_notes} onChange={e => setForm(f => ({ ...f, client_notes: e.target.value }))} rows={3} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-6">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                    <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? "Save Changes" : "Create Project"}</Button>
                  </div>
                </form>
              </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleting} title="Delete Project" message={`Delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={saving} />
    </div>
  );
}
