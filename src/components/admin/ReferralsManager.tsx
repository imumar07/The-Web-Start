"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Gift, CheckCircle2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { ReferralWithClient, ReferralStatus } from "@/types/referral";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n ?? 0);

interface ClientOption { id: number; name: string; email: string; company?: string | null }

const emptyForm = () => ({
  referrer_client_id: "",
  referred_name: "",
  referred_email: "",
  referred_phone: "",
  commission_amount: "",
  status: "pending" as ReferralStatus,
  referral_date: new Date().toISOString().split("T")[0],
  paid_date: "",
  notes: "",
});

export function ReferralsManager() {
  const [referrals, setReferrals] = useState<ReferralWithClient[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReferralWithClient | null>(null);
  const [deleting, setDeleting] = useState<ReferralWithClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm());

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/referrals").then(r => r.json()),
      fetch("/api/admin/clients").then(r => r.json()),
    ])
      .then(([refData, clientData]) => {
        if (refData.success) setReferrals(refData.data);
        if (clientData.success) setClients(clientData.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setError("");
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (r: ReferralWithClient) => {
    setEditing(r);
    setError("");
    setForm({
      referrer_client_id: String(r.referrer_client_id),
      referred_name: r.referred_name,
      referred_email: r.referred_email ?? "",
      referred_phone: r.referred_phone ?? "",
      commission_amount: String(r.commission_amount),
      status: r.status,
      referral_date: r.referral_date?.split("T")[0] ?? "",
      paid_date: r.paid_date?.split("T")[0] ?? "",
      notes: r.notes ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        referrer_client_id: Number(form.referrer_client_id),
        referred_name: form.referred_name,
        referred_email: form.referred_email || null,
        referred_phone: form.referred_phone || null,
        commission_amount: Number(form.commission_amount) || 0,
        status: form.status,
        referral_date: form.referral_date || undefined,
        paid_date: form.status === "paid" ? (form.paid_date || new Date().toISOString().split("T")[0]) : null,
        notes: form.notes || null,
      };
      const url = editing ? `/api/admin/referrals/${editing.id}` : "/api/admin/referrals";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Failed to save referral");
      setShowForm(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/referrals/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      load();
    } finally { setSaving(false); }
  };

  const markPaid = async (r: ReferralWithClient) => {
    await fetch(`/api/admin/referrals/${r.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paid_date: new Date().toISOString().split("T")[0] }),
    });
    load();
  };

  const totalPaid = referrals.filter(r => r.status === "paid").reduce((s, r) => s + r.commission_amount, 0);
  const totalPending = referrals.filter(r => r.status === "pending").reduce((s, r) => s + r.commission_amount, 0);
  const uniqueReferrers = new Set(referrals.map(r => r.referrer_client_id)).size;

  const columns = [
    {
      key: "referrer_name", header: "Referred By", sortable: true,
      render: (r: ReferralWithClient) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
               style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            {r.referrer_name[0]}
          </div>
          <div>
            <div className="text-white font-medium text-sm">{r.referrer_name}</div>
            <div className="text-gray-500 text-xs">{r.referrer_company || r.referrer_email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "referred_name", header: "Referred", sortable: true,
      render: (r: ReferralWithClient) => (
        <div>
          <div className="text-white text-sm">{r.referred_name}</div>
          <div className="text-gray-500 text-xs">{r.referred_email || r.referred_phone || "—"}</div>
        </div>
      ),
    },
    {
      key: "commission_amount", header: "Commission", sortable: true,
      render: (r: ReferralWithClient) => <span className="text-emerald-400 font-semibold text-sm">{fmt(r.commission_amount)}</span>,
    },
    { key: "status", header: "Status", render: (r: ReferralWithClient) => <StatusBadge status={r.status} /> },
    {
      key: "referral_date", header: "Date", sortable: true,
      render: (r: ReferralWithClient) => <span className="text-gray-500 text-xs">{r.referral_date ? new Date(r.referral_date).toLocaleDateString() : "—"}</span>,
    },
    {
      key: "actions", header: "",
      render: (r: ReferralWithClient) => (
        <div className="flex items-center gap-2 justify-end">
          {r.status === "pending" && (
            <button onClick={() => markPaid(r)} title="Mark as paid"
              className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleting(r)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Referral Commissions</h1>
          <p className="text-gray-500 text-sm">Track clients who referred new business and the commission owed to them</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Add Referral</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <div className="text-2xl font-bold text-white">{referrals.length}</div>
          <div className="text-sm text-gray-400 mt-0.5">Total Referrals</div>
        </div>
        <div className="glass rounded-2xl p-5 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20">
          <div className="text-2xl font-bold text-white">{uniqueReferrers}</div>
          <div className="text-sm text-gray-400 mt-0.5">Referring Clients</div>
        </div>
        <div className="glass rounded-2xl p-5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20">
          <div className="text-2xl font-bold text-white">{fmt(totalPending)}</div>
          <div className="text-sm text-gray-400 mt-0.5">Pending Commission</div>
        </div>
        <div className="glass rounded-2xl p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
          <div className="text-2xl font-bold text-white">{fmt(totalPaid)}</div>
          <div className="text-sm text-gray-400 mt-0.5">Paid Out</div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/[0.07] p-5">
        <DataTable
          data={referrals}
          columns={columns}
          searchKeys={["referrer_name", "referred_name", "referred_email"]}
          loading={loading}
          emptyMessage="No referrals yet. Add one when a client refers new business."
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[51] overflow-y-auto overscroll-contain touch-pan-y">
              <div className="flex min-h-full items-center justify-center p-4">
                <m.div className="glass-strong rounded-2xl p-7 w-full max-w-lg border border-white/15 shadow-glass-lg my-8 max-h-[90vh] overflow-y-auto overscroll-contain"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="font-display font-bold text-white text-lg">
                      {editing ? "Edit Referral" : "Add New Referral"}
                    </h2>
                  </div>

                  {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

                  <form onSubmit={handleSave} className="space-y-4">
                    <Select
                      label="Referring Client"
                      options={[{ value: "", label: "Select a client..." }, ...clients.map(c => ({ value: String(c.id), label: c.company ? `${c.name} (${c.company})` : c.name }))]}
                      value={form.referrer_client_id}
                      onChange={e => setForm(f => ({ ...f, referrer_client_id: e.target.value }))}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Referred Person's Name" value={form.referred_name}
                        onChange={e => setForm(f => ({ ...f, referred_name: e.target.value }))}
                        placeholder="e.g. Rahul Sharma" required />
                      <Input label="Commission Amount (₹)" type="number" min={0} step={1} value={form.commission_amount}
                        onChange={e => setForm(f => ({ ...f, commission_amount: e.target.value }))}
                        placeholder="e.g. 5000" required />
                      <Input label="Referred Person's Email" type="email" value={form.referred_email}
                        onChange={e => setForm(f => ({ ...f, referred_email: e.target.value }))}
                        placeholder="rahul@example.com" />
                      <Input label="Referred Person's Phone" type="tel" value={form.referred_phone}
                        onChange={e => setForm(f => ({ ...f, referred_phone: e.target.value }))}
                        placeholder="+91 98765 43210" />
                      <Input label="Referral Date" type="date" value={form.referral_date}
                        onChange={e => setForm(f => ({ ...f, referral_date: e.target.value }))} />
                      <Select
                        label="Status"
                        options={statusOptions}
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as ReferralStatus }))}
                      />
                      {form.status === "paid" && (
                        <Input label="Paid Date" type="date" value={form.paid_date}
                          onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))} />
                      )}
                    </div>

                    <Textarea label="Notes" rows={3} value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Any additional details about this referral..." />

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 justify-center border border-white/10">Cancel</Button>
                      <Button type="submit" loading={saving} className="flex-1 justify-center" disabled={!form.referrer_client_id || !form.referred_name}>
                        {editing ? "Save Changes" : "Add Referral"}
                      </Button>
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
        title="Delete Referral"
        message={`Are you sure you want to delete the referral for ${deleting?.referred_name}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={saving}
      />
    </div>
  );
}
