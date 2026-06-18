"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { ClientPublic } from "@/types/dashboard";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export function ClientsManager() {
  const [clients, setClients] = useState<ClientPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientPublic | null>(null);
  const [deleting, setDeleting] = useState<ClientPublic | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phoneCode: "+91", phone: "", status: "active" });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/clients").then(r => r.json())
      .then(d => { if (d.success) setClients(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", company: "", phoneCode: "+91", phone: "", status: "active" });
    setShowForm(true);
  };

  const openEdit = (c: ClientPublic) => {
    setEditing(c);
    // Split stored phone into code + number (e.g. "+91 9876543210" → "+91", "9876543210")
    const raw = c.phone ?? "";
    const codeMatch = raw.match(/^(\+\d{1,4})\s*(.*)/);
    const phoneCode = codeMatch ? codeMatch[1] : "+91";
    const phone     = codeMatch ? codeMatch[2] : raw;
    setForm({ name: c.name, email: c.email, password: "", company: c.company ?? "", phoneCode, phone, status: c.status });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullPhone = form.phone ? `${form.phoneCode} ${form.phone}` : "";
      const body = editing
        ? { name: form.name, company: form.company, phone: fullPhone, status: form.status }
        : { ...form, phone: fullPhone };
      const url = editing ? `/api/admin/clients/${editing.id}` : "/api/admin/clients";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/clients/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      load();
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: "name", header: "Client", sortable: true,
      render: (c: ClientPublic) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
               style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            {c.name[0]}
          </div>
          <div>
            <div className="text-white font-medium text-sm">{c.name}</div>
            <div className="text-gray-500 text-xs">{c.email}</div>
          </div>
        </div>
      ),
    },
    { key: "company", header: "Company", sortable: true, render: (c: ClientPublic) => <span className="text-gray-400 text-sm">{c.company ?? "—"}</span> },
    { key: "phone", header: "Phone", render: (c: ClientPublic) => <span className="text-gray-400 text-sm">{c.phone ?? "—"}</span> },
    { key: "status", header: "Status", render: (c: ClientPublic) => <StatusBadge status={c.status} /> },
    {
      key: "created_at", header: "Joined", sortable: true,
      render: (c: ClientPublic) => <span className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions", header: "",
      render: (c: ClientPublic) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleting(c)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.length} total clients</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Add Client</Button>
      </div>

      <div className="glass rounded-2xl border border-white/[0.07] p-5">
        <DataTable
          data={clients}
          columns={columns}
          searchKeys={["name", "email", "company"]}
          loading={loading}
          emptyMessage="No clients yet. Add your first client."
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
              <m.div className="glass-strong rounded-2xl p-7 w-full max-w-md border border-white/15 shadow-glass-lg"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="font-display font-bold text-white text-lg">
                    {editing ? "Edit Client" : "Add New Client"}
                  </h2>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={!!editing} />
                  </div>
                  {!editing && (
                    <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="Min 8 characters" />
                  )}
                  <Input label="Company Name" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Pvt. Ltd." />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={form.phoneCode}
                        onChange={e => setForm(f => ({ ...f, phoneCode: e.target.value }))}
                        className="w-24 rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      >
                        {["+91","+1","+44","+971","+65","+61","+49","+33","+81","+86"].map(c => (
                          <option key={c} value={c} className="bg-[#08081a]">{c}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="98765 43210"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      />
                    </div>
                  </div>
                  {editing && (
                    <Select label="Status" options={statusOptions} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                    <Button type="submit" loading={saving} className="flex-1 justify-center">{editing ? "Save Changes" : "Create Client"}</Button>
                  </div>
                </form>
              </m.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Client"
        message={`Are you sure you want to delete ${deleting?.name}? This will also delete all their projects and invoices.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={saving}
      />
    </div>
  );
}
