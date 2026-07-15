"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Eye, Edit2, Trash2, FileText, Send,
  CheckCircle, XCircle, X, Save, Printer, ArrowRight, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Input";
import { StatusBadge } from "./StatusBadge";
// react-pdf is loaded lazily to keep the initial bundle small
async function generatePdfBlob(quote: QuotationWithItems): Promise<Blob> {
  const [{ pdf }, { QuotationPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/admin/QuotationPdfDocument"),
  ]);
  return pdf(<QuotationPdfDocument quote={quote} />).toBlob();
}
import type { Quotation, QuotationWithItems, CreateQuotationItem, QuotationStatus } from "@/types/quotation";

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currency ?? "INR", minimumFractionDigits: 0 }).format(n ?? 0);

const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

const UNIT_OPTIONS = ["project", "service", "hour", "day", "month", "unit"];

const emptyItem = (): CreateQuotationItem => ({
  service: "", description: "", quantity: 1, unit: "service",
  unit_price: 0, discount_percent: 0, tax_percent: 0, amount: 0,
});

function calcAmount(item: CreateQuotationItem) {
  const gross = item.quantity * item.unit_price;
  const afterDiscount = gross * (1 - (item.discount_percent ?? 0) / 100);
  return Math.round(afterDiscount * 100) / 100;
}

function calcTotals(items: CreateQuotationItem[], discountType: string, discountValue: number) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discountAmount = discountType === "percent" ? subtotal * (discountValue / 100) : discountValue;
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, taxAmount: 0, total };
}

function LogoMark(props: { className?: string }) {
  return (
    <svg viewBox="0 0 375 375" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="#7c3aed" d="M374.714844 107.667969C374.71875 107.351562 374.6875 107.039062 374.628906 106.730469C374.566406 106.417969 374.476562 106.117188 374.359375 105.828125C374.238281 105.535156 374.089844 105.257812 373.917969 104.996094C373.742188 104.734375 373.542969 104.488281 373.320312 104.265625C373.097656 104.042969 372.855469 103.84375 372.59375 103.667969C372.332031 103.492188 372.054688 103.347656 371.761719 103.226562C371.472656 103.105469 371.171875 103.015625 370.859375 102.953125C370.550781 102.894531 370.238281 102.863281 369.921875 102.863281L272.894531 102.863281L272.894531 7.605469L272.882812 7.605469C272.886719 7.289062 272.855469 6.976562 272.796875 6.667969C272.738281 6.355469 272.648438 6.054688 272.527344 5.765625C272.410156 5.472656 272.261719 5.195312 272.089844 4.933594C271.914062 4.667969 271.714844 4.425781 271.492188 4.203125C271.269531 3.980469 271.027344 3.78125 270.765625 3.605469C270.503906 3.429688 270.226562 3.28125 269.933594 3.160156C269.640625 3.042969 269.339844 2.949219 269.03125 2.890625C268.722656 2.832031 268.410156 2.800781 268.09375 2.800781L163.183594 2.800781C162.546875 2.800781 161.9375 2.925781 161.347656 3.167969C160.761719 3.410156 160.242188 3.757812 159.792969 4.207031L106.53125 57.386719C106.070312 57.710938 105.679688 58.101562 105.355469 58.5625L3.535156 160.222656C2.847656 160.660156 2.304688 161.238281 1.914062 161.953125C1.519531 162.671875 1.324219 163.4375 1.324219 164.253906L1.324219 267.007812C1.324219 267.324219 1.355469 267.636719 1.414062 267.945312C1.476562 268.253906 1.566406 268.554688 1.6875 268.847656C1.808594 269.136719 1.957031 269.414062 2.132812 269.675781C2.308594 269.9375 2.507812 270.179688 2.730469 270.402344C2.953125 270.628906 3.195312 270.824219 3.457031 271C3.71875 271.175781 3.996094 271.324219 4.289062 271.445312C4.578125 271.566406 4.878906 271.65625 5.1875 271.71875C5.496094 271.777344 5.808594 271.8 6.121094 271.800781L107.234375 271.800781L107.234375 368.433594C107.234375 368.746094 107.265625 369.058594 107.324219 369.367188C107.386719 369.675781 107.476562 369.976562 107.597656 370.269531C107.714844 370.5625 107.863281 370.839844 108.035156 371.101562C108.210938 371.367188 108.410156 371.609375 108.632812 371.832031C108.855469 372.054688 109.097656 372.253906 109.359375 372.429688C109.621094 372.605469 109.898438 372.753906 110.191406 372.875C110.484375 372.996094 110.785156 373.089844 111.09375 373.148438C111.402344 373.207031 111.714844 373.238281 112.03125 373.238281L217.121094 373.238281C217.757812 373.238281 218.367188 373.113281 218.957031 372.871094C219.542969 372.628906 220.0625 372.28125 220.511719 371.832031L273.773438 318.652344C274.234375 318.328125 274.625 317.9375 274.949219 317.476562L376.769531 215.816406C377.457031 215.378906 378 214.800781 378.390625 214.085938C378.785156 213.367188 378.980469 212.601562 378.980469 211.785156L378.980469 108.03125C378.980469 107.714844 378.949219 107.402344 378.890625 107.09375C378.828125 106.785156 378.738281 106.484375 378.617188 106.191406C378.496094 105.902344 378.347656 105.625 378.175781 105.363281C378.003906 105.097656 377.804688 104.855469 377.582031 104.632812C377.359375 104.410156 377.117188 104.210938 376.855469 104.035156C376.59375 103.859375 376.316406 103.710938 376.023438 103.589844C375.730469 103.472656 375.429688 103.378906 375.121094 103.320312C374.8125 103.261719 374.5 103.230469 374.183594 103.230469L374.183594 103.230469L374.714844 107.667969Z" />
      <path fill="#35ff45" d="M114.078125 66.121094L207.640625 66.121094L207.640625 159.457031L114.078125 159.457031Z" />
      <path fill="#35ff45" d="M114.078125 271.804688L207.640625 271.804688L207.640625 365.195312L114.078125 365.195312Z" />
      <path fill="#06b6d4" d="M104.472656 159.453125L17.898438 159.453125L104.472656 73.011719Z" />
      <path fill="#06b6d4" d="M263.292969 105.703125L217.246094 152.527344L217.246094 64.542969L263.292969 19.09375Z" />
      <path fill="#06b6d4" d="M305.410156 271.804688L217.246094 358.542969L217.246094 271.804688Z" />
      <path fill="#06b6d4" d="M313.710938 159.453125L223.898438 159.453125L270.105469 112.46875L358.675781 112.46875Z" />
      <path fill="#06b6d4" d="M165.171875 12.40625L256.394531 12.40625L211.703125 56.519531L120.992188 56.519531Z" />
      <path fill="#06b6d4" d="M320.5625 256.902344L320.5625 166.183594L365.113281 119.628906L365.113281 213.074219Z" />
      <path fill="#ffffff" d="M114.078125 169.058594L207.640625 169.058594L207.640625 262.203125L114.078125 262.203125Z" />
      <path fill="#35ff45" d="M217.246094 169.058594L310.792969 169.058594L310.792969 262.203125L217.246094 262.203125Z" />
      <path fill="#35ff45" d="M10.925781 169.058594L104.472656 169.058594L104.472656 262.203125L10.925781 262.203125Z" />
    </svg>
  );
}

// ── Print Preview ──────────────────────────────────────────────────────────────
function PrintPreview({ quote }: { quote: QuotationWithItems }) {
  const items = quote.items ?? [];
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [previewingPdf, setPreviewingPdf] = useState(false);

  const subtotal = quote.subtotal;
  const discountAmount = quote.discount_amount;
  const taxAmount = quote.tax_amount;
  const total = quote.total;

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);

    try {
      const blob = await generatePdfBlob(quote);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${quote.quote_no ?? "quotation"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("PDF export failed", error);
      alert("PDF export failed. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    setPreviewingPdf(true);

    try {
      const blob = await generatePdfBlob(quote);
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        alert("Please allow pop-ups to preview the PDF.");
        URL.revokeObjectURL(url);
        return;
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("PDF preview failed", error);
      alert("PDF preview failed. Please try again.");
    } finally {
      setPreviewingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Print Preview</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePreviewPdf}
            disabled={previewingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-500 text-white text-sm rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> {previewingPdf ? "Opening preview..." : "Preview PDF"}
          </button>
          <button onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded-lg transition-colors">
            <Printer className="w-4 h-4" /> {generatingPdf ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Printable area */}
      <div id="quote-print-area" className="bg-white rounded-xl overflow-hidden text-gray-900 font-sans">

        {/* ── Header bar ── */}
        <div className="flex justify-between items-start px-8 py-6 gap-6" style={{ background: "#0f0f23" }}>
          <div className="flex items-center gap-3">
            <LogoMark className="w-10 h-10 flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-white tracking-widest">THE WEB START</div>
              <div className="text-[11px] text-purple-400 mt-0.5">thewebstart.in · info@thewebstart.in</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{quote.quote_no}</div>
            <div className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">{quote.title}</div>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white"
              style={{ background: quote.status === "accepted" ? "#059669" : quote.status === "rejected" ? "#dc2626" : quote.status === "sent" ? "#2563eb" : "#7c3aed" }}>
              {quote.status}
            </span>
          </div>
        </div>

        {/* Accent strip */}
        <div className="h-[3px]" style={{ background: "#7c3aed" }} />

        {/* ── Meta row ── */}
        <div className="flex gap-10 px-8 py-3 bg-gray-50 border-b border-gray-100 text-xs">
          {[
            ["Issue Date", (quote.created_at ?? "").split("T")[0]],
            ["Valid Until", quote.valid_until ?? "—"],
            ["Currency", quote.currency],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-gray-400 uppercase tracking-wider text-[9px] mb-0.5">{label}</div>
              <div className="font-semibold text-gray-900 text-xs">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Parties ── */}
        <div className="grid grid-cols-2 gap-4 px-8 py-5 border-b border-gray-100">
          {[
            {
              label: "From",
              name: "The Web Start",
              lines: ["info@thewebstart.in", "www.thewebstart.in"],
            },
            {
              label: "Prepared For",
              name: quote.client_name,
              lines: [
                quote.client_company,
                quote.client_email,
                quote.client_phone,
                quote.client_address,
              ].filter(Boolean) as string[],
            },
          ].map(p => (
            <div key={p.label} className="border border-gray-100 rounded-lg p-4">
              <div className="text-[9px] font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2 mb-3">{p.label}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{p.name}</div>
              {p.lines.map((l, i) => <div key={i} className="text-xs text-gray-500 leading-5">{l}</div>)}
            </div>
          ))}
        </div>

        {/* ── Items table ── */}
        <div className="px-8 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#0f0f23" }} className="rounded-lg">
                <th className="text-left text-[9px] font-bold text-white uppercase tracking-wider py-2.5 pl-3 pr-2 rounded-l-lg w-7">#</th>
                <th className="text-left text-[9px] font-bold text-white uppercase tracking-wider py-2.5 px-2">Service / Description</th>
                <th className="text-right text-[9px] font-bold text-white uppercase tracking-wider py-2.5 px-2 w-10">Qty</th>
                <th className="text-right text-[9px] font-bold text-white uppercase tracking-wider py-2.5 px-2 w-12">Unit</th>
                <th className="text-right text-[9px] font-bold text-white uppercase tracking-wider py-2.5 px-2 w-24">Unit Price</th>
                <th className="text-right text-[9px] font-bold text-white uppercase tracking-wider py-2.5 px-2 w-12">Disc%</th>
                <th className="text-right text-[9px] font-bold text-white uppercase tracking-wider py-2.5 pl-2 pr-3 rounded-r-lg w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((item, i) => (
                <tr key={item.id ?? i} className={cn("border-b border-gray-100", i % 2 === 1 && "bg-gray-50/60")}>
                  <td className="py-3 pl-3 pr-2 text-gray-400 text-xs align-top">{i + 1}</td>
                  <td className="py-3 px-2 align-top">
                    <div className="font-semibold text-gray-900 text-[13px] leading-tight">{item.service}</div>
                    {item.description && (
                      <ul className="mt-1.5 space-y-0.5">
                        {item.description.split("\n").filter(Boolean).map((d, di) => (
                          <li key={di} className="text-[11px] text-gray-500 flex gap-1.5 leading-relaxed">
                            <span className="text-purple-500 mt-px">•</span>
                            {d.replace(/^\s*[-•‣]\s*/, "")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-gray-700 align-top">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-xs text-gray-500 align-top">{item.unit}</td>
                  <td className="py-3 px-2 text-right text-xs text-gray-700 align-top">{fmt(item.unit_price, quote.currency)}</td>
                  <td className="py-3 px-2 text-right text-xs text-gray-500 align-top">{item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}</td>
                  <td className="py-3 pl-2 pr-3 text-right font-bold text-gray-900 text-sm align-top">{fmt(item.amount, quote.currency)}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No line items.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Totals ── */}
        <div className="px-8 pb-6 flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 py-1.5 border-b border-gray-100">
              <span>Subtotal</span><span className="font-medium text-gray-800">{fmt(subtotal, quote.currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs py-1.5 border-b border-gray-100 text-emerald-600">
                <span>Discount {quote.discount_type === "percent" ? `(${quote.discount_value}%)` : "(fixed)"}</span>
                <span className="font-medium">− {fmt(discountAmount, quote.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl mt-2" style={{ background: "#0f0f23" }}>
              <span className="text-sm font-bold text-purple-400 tracking-wider uppercase">Total</span>
              <span className="text-xl font-bold text-white">{fmt(total, quote.currency)}</span>
            </div>
          </div>
        </div>

        {/* ── Terms / Notes ── */}
        {(quote.terms || quote.notes) && (
          <div className={cn("px-8 pb-8 grid gap-4", quote.terms && quote.notes ? "grid-cols-2" : "grid-cols-1")}>
            {quote.terms && (
              <div className="border border-gray-100 rounded-lg p-4">
                <div className="text-[9px] font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2 mb-3">Terms & Conditions</div>
                <div className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed">{quote.terms}</div>
              </div>
            )}
            {quote.notes && (
              <div className="border border-gray-100 rounded-lg p-4">
                <div className="text-[9px] font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2 mb-3">Additional Notes</div>
                <div className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed">{quote.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LogoMark className="w-5 h-5" />
            <span className="text-[10px] text-gray-400">The Web Start · thewebstart.in</span>
          </div>
          <span className="text-[10px] text-gray-400">Thank you for your business!</span>
        </div>
      </div>
    </div>
  );
}

// ── Item Row ───────────────────────────────────────────────────────────────────
function ItemRow({
  item, index, onChange, onRemove, canRemove,
}: {
  item: CreateQuotationItem;
  index: number;
  onChange: (index: number, item: CreateQuotationItem) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const update = (patch: Partial<CreateQuotationItem>) => {
    const next = { ...item, ...patch };
    next.amount = calcAmount(next);
    onChange(index, next);
  };

  return (
    <div className="bg-[#0d0d2b] border border-white/[0.08] rounded-xl p-4 space-y-3 relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">#{index + 1}</span>
        {canRemove && (
          <button onClick={() => onRemove(index)}
            className="text-red-500/60 hover:text-red-400 p-1 rounded transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Service name */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Service Name *</label>
        <input value={item.service} onChange={e => update({ service: e.target.value })}
          placeholder="e.g. Website Design & Development"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors" />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Description (one bullet per line)</label>
        <textarea value={item.description ?? ""} onChange={e => update({ description: e.target.value })}
          rows={3} placeholder={"Responsive 5-page website\nSEO optimisation\nContact form integration"}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none" />
      </div>

      {/* Qty / Unit / Unit Price / Disc / Amount */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Qty</label>
          <input type="number" min={0.01} step={0.01} value={item.quantity}
            onChange={e => update({ quantity: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Unit</label>
          <select value={item.unit} onChange={e => update({ unit: e.target.value })}
            className="w-full bg-[#0a0a1f] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors">
            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Unit Price (₹)</label>
          <input type="number" min={0} step={1} value={item.unit_price}
            onChange={e => update({ unit_price: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Discount %</label>
          <input type="number" min={0} max={100} step={0.5} value={item.discount_percent}
            onChange={e => update({ discount_percent: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Amount</label>
          <div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-purple-300 font-semibold">
            {fmt(item.amount)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Form ───────────────────────────────────────────────────────────────────────
interface FormData {
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  client_address: string;
  title: string;
  valid_until: string;
  currency: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  tax_percent: number;
  terms: string;
  notes: string;
  items: CreateQuotationItem[];
}

const defaultForm = (): FormData => ({
  client_id: "", client_name: "", client_email: "", client_phone: "", client_company: "", client_address: "",
  title: "Quotation", valid_until: inDays(30), currency: "INR",
  discount_type: "percent", discount_value: 0, tax_percent: 0,
  terms: "1. 50% advance payment required to start the project.\n2. Balance payment due on project completion.\n3. Quotation valid for 30 days from the date of issue.\n4. Any additional requirements will be quoted separately.",
  notes: "",
  items: [emptyItem()],
});

function toForm(q: QuotationWithItems): FormData {
  return {
    client_id: q.client_id ? String(q.client_id) : "",
    client_name: q.client_name, client_email: q.client_email ?? "",
    client_phone: q.client_phone ?? "", client_company: q.client_company ?? "",
    client_address: q.client_address ?? "", title: q.title, valid_until: q.valid_until ?? "",
    currency: q.currency, discount_type: q.discount_type, discount_value: q.discount_value,
    tax_percent: q.tax_percent, terms: q.terms ?? "", notes: q.notes ?? "",
    items: q.items.map(i => ({ ...i, description: i.description ?? "" })),
  };
}

function QuotationForm({
  initial, onSave, onCancel, saving, clients,
}: {
  initial?: QuotationWithItems;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving: boolean;
  clients: { id: number; name: string; email: string; company?: string; phone?: string; address?: string }[];
}) {
  const [form, setForm] = useState<FormData>(initial ? toForm(initial) : defaultForm());
  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateItem = useCallback((i: number, item: CreateQuotationItem) => {
    setForm(prev => {
      const items = [...prev.items];
      items[i] = item;
      return { ...prev, items };
    });
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (i: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  const { subtotal, discountAmount, total } = calcTotals(
    form.items, form.discount_type, form.discount_value
  );

  return (
    <div className="space-y-6">
      {/* Client & Meta */}
      <div className="glass rounded-2xl p-6 border border-white/[0.08]">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" /> Client & Quotation Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Existing Client</label>
            <Select label="" options={[
              { value: "", label: "Select existing client..." },
              ...clients.map(c => ({ value: String(c.id), label: c.name })),
            ]} value={form.client_id} onChange={e => {
              const clientId = e.target.value;
              const client = clients.find(c => String(c.id) === clientId);
              set("client_id", clientId);
              if (client) {
                set("client_name", client.name);
                set("client_email", client.email);
                set("client_company", client.company ?? "");
                set("client_phone", client.phone ?? "");
                set("client_address", client.address ?? "");
              }
            }}
            />
          </div>
          {([
            ["client_name", "Client Name *", "text", "e.g. Acme Corp"],
            ["client_company", "Company", "text", "Company name"],
            ["client_email", "Email", "email", "client@example.com"],
            ["client_phone", "Phone", "tel", "+91 98765 43210"],
            ["client_address", "Address", "text", "City, State"],
            ["title", "Quotation Title", "text", "e.g. Website Development Proposal"],
          ] as const).map(([key, label, type, placeholder]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type} value={form[key] as string}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Valid Until</label>
            <input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Currency</label>
            <select value={form.currency} onChange={e => set("currency", e.target.value)}
              className="w-full bg-[#0a0a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors">
              {["INR", "USD", "EUR", "GBP", "AED"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-2xl p-6 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Line Items
          </h3>
          <button onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Service
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, i) => (
            <ItemRow key={i} item={item} index={i} onChange={updateItem}
              onRemove={removeItem} canRemove={form.items.length > 1} />
          ))}
        </div>
      </div>

      {/* Totals & discounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          <h3 className="text-white font-semibold mb-4">Overall Discount</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Discount Type</label>
              <select value={form.discount_type} onChange={e => set("discount_type", e.target.value as "percent" | "fixed")}
                className="w-full bg-[#0a0a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="w-36">
              <label className="text-xs text-gray-500 block mb-1">
                {form.discount_type === "percent" ? "Discount %" : "Discount Amount (₹)"}
              </label>
              <input type="number" min={0} value={form.discount_value}
                onChange={e => set("discount_value", Number(e.target.value))}
                placeholder={form.discount_type === "percent" ? "e.g. 10" : "e.g. 5000"}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
            </div>
          </div>
        </div>

        {/* Live summary */}
        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          <h3 className="text-white font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400 py-1 border-b border-white/5">
              <span>Subtotal</span><span className="text-white">{fmt(subtotal, form.currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 py-1 border-b border-white/5">
                <span>Discount {form.discount_type === "percent" ? `(${form.discount_value}%)` : "(fixed)"}</span>
                <span>− {fmt(discountAmount, form.currency)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-3 rounded-xl mt-2"
              style={{ background: "linear-gradient(135deg,#7c3aed15,#06b6d415)", border: "1px solid #7c3aed30" }}>
              <span className="font-bold text-white text-base">Total</span>
              <span className="font-bold text-purple-300 text-xl">{fmt(total, form.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          <h3 className="text-white font-semibold mb-3 text-sm">Terms & Conditions</h3>
          <textarea rows={6} value={form.terms} onChange={e => set("terms", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none" />
        </div>
        <div className="glass rounded-2xl p-6 border border-white/[0.08]">
          <h3 className="text-white font-semibold mb-3 text-sm">Additional Notes</h3>
          <textarea rows={6} value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Any special notes or instructions for the client..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.client_name || form.items.every(i => !i.service)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all">
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Quotation</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Manager ───────────────────────────────────────────────────────────────
type View = "list" | "create" | "edit" | "preview";

export function QuotationsManager() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string; email: string; company?: string; phone?: string; address?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<QuotationWithItems | null>(null);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [quotRes, clientRes] = await Promise.all([
        fetch("/api/admin/quotations"),
        fetch("/api/admin/clients"),
      ]);
      const [quotData, clientData] = await Promise.all([quotRes.json(), clientRes.json()]);
      setQuotations(quotData.data ?? []);
      setClients(clientData.data ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadDetail = async (id: number) => {
    const res = await fetch(`/api/admin/quotations/${id}`);
    const data = await res.json();
    const quote = data.data as QuotationWithItems;
    return {
      ...quote,
      items: (quote.items ?? []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_percent: Number(item.discount_percent),
        tax_percent: Number(item.tax_percent),
        amount: Number(item.amount),
      })),
    } as QuotationWithItems;
  };

  const handleCreate = async (form: FormData) => {
    setSaving(true); setError("");
    try {
      const payload = { ...form, client_id: form.client_id ? Number(form.client_id) : undefined };
      const res = await fetch("/api/admin/quotations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || !d.success) { throw new Error(d.error ?? "Failed to create quotation"); }
      await load();
      setView("list");
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form: FormData) => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const payload = { ...form, client_id: form.client_id ? Number(form.client_id) : undefined };
      const res = await fetch(`/api/admin/quotations/${selected.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      await load();
      setView("list");
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: number, status: QuotationStatus, sendEmail = false) => {
    await fetch(`/api/admin/quotations/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...(sendEmail ? { send_email: true } : {}) }),
    });
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this quotation? This cannot be undone.")) return;
    await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
    await load();
  };

  const handleConvert = async (id: number) => {
    if (!confirm("Convert to invoice? This will create a new invoice from this quotation.")) return;
    const res = await fetch(`/api/admin/quotations/${id}/convert`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Failed"); return; }
    alert(`Invoice ${data.data?.invoiceNo} created!`);
    await load();
  };

  const handleDuplicate = async (id: number) => {
    if (!confirm("Duplicate this quotation? A new draft copy will be created.")) return;
    setDuplicating(true);
    try {
      const quote = await loadDetail(id);
      const payload = {
        client_id: quote.client_id,
        client_name: quote.client_name,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        client_company: quote.client_company,
        client_address: quote.client_address,
        title: quote.title,
        valid_until: quote.valid_until,
        currency: quote.currency,
        discount_type: quote.discount_type,
        discount_value: quote.discount_value,
        tax_percent: quote.tax_percent,
        terms: quote.terms,
        notes: quote.notes,
        items: quote.items.map((item) => ({
          service: item.service,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          tax_percent: item.tax_percent,
          amount: item.amount,
        })),
      };
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to duplicate quotation");
      }
      await load();
      alert(`Quotation duplicated as ${data.quoteNo ?? "new quotation"}.`);
    } catch (error) {
      console.error(error);
      alert((error as Error).message || "Quotation duplication failed.");
    } finally {
      setDuplicating(false);
    }
  };

  const filtered = quotations.filter(q => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return q.quote_no.toLowerCase().includes(s) || q.client_name.toLowerCase().includes(s) || (q.client_company ?? "").toLowerCase().includes(s);
    }
    return true;
  });

  if (view === "create") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-xl font-bold text-white">New Quotation</h2>
        </div>
        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <QuotationForm clients={clients} onSave={handleCreate} onCancel={() => setView("list")} saving={saving} />
      </div>
    );
  }

  if (view === "edit" && selected) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-xl font-bold text-white">Edit {selected.quote_no}</h2>
        </div>
        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <QuotationForm clients={clients} initial={selected} onSave={handleEdit} onCancel={() => setView("list")} saving={saving} />
      </div>
    );
  }

  if (view === "preview" && selected) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-xl font-bold text-white">{selected.quote_no} Preview</h2>
          <StatusBadge status={selected.status} />
        </div>
        <PrintPreview quote={selected} />
      </div>
    );
  }

  // ── List ──
  const totalsByStatus = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "Total", count: quotations.length, value: quotations.reduce((s, q) => s + (q.total ?? 0), 0), color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/20" },
    { label: "Draft", count: totalsByStatus.draft ?? 0, value: null, color: "from-gray-500/20 to-gray-600/10", border: "border-gray-500/20" },
    { label: "Sent", count: totalsByStatus.sent ?? 0, value: null, color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/20" },
    { label: "Accepted", count: totalsByStatus.accepted ?? 0, value: quotations.filter(q => q.status === "accepted").reduce((s, q) => s + q.total, 0), color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={cn("glass rounded-2xl p-5 bg-gradient-to-br border", s.color, s.border)}>
            <div className="text-2xl font-bold text-white">{s.count}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
            {s.value !== null && <div className="text-xs text-gray-500 mt-1">{fmt(s.value)}</div>}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors w-56" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0a0a1f] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-colors">
            <option value="all">All Statuses</option>
            {["draft", "sent", "accepted", "rejected", "expired"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <button onClick={() => setView("create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold text-sm rounded-xl transition-all whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search || statusFilter !== "all" ? "No quotations match your filter" : "No quotations yet. Create your first one."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Quote No", "Client", "Date", "Valid Until", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr key={q.id} className={cn("border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors", i % 2 === 0 ? "" : "bg-white/[0.01]")}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-purple-300">{q.quote_no}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white font-medium">{q.client_name}</div>
                      {q.client_company && <div className="text-xs text-gray-500">{q.client_company}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{q.created_at?.split("T")[0]}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{q.valid_until ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white text-sm">{fmt(q.total, q.currency)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={async () => { const d = await loadDetail(q.id); setSelected(d); setView("preview"); }}
                          title="Preview" className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-500/10">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={async () => { const d = await loadDetail(q.id); setSelected(d); setView("edit"); }}
                          title="Edit" className="p-1.5 text-gray-500 hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-500/10">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {q.status === "draft" && (
                          <button onClick={() => handleStatus(q.id, "sent", true)}
                            title="Send quotation" className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {q.status === "sent" && (
                          <>
                            <button onClick={() => handleStatus(q.id, "accepted")}
                              title="Mark Accepted" className="p-1.5 text-gray-500 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatus(q.id, "rejected")}
                              title="Mark Rejected" className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {q.status === "accepted" && !q.converted_invoice_id && (
                          <button onClick={() => handleConvert(q.id)}
                            title="Convert to Invoice" className="p-1.5 text-gray-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-500/10">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(q.id)}
                          disabled={duplicating}
                          title="Duplicate quotation" className="p-1.5 text-gray-500 hover:text-indigo-400 disabled:opacity-50 transition-colors rounded-lg hover:bg-indigo-500/10">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)}
                          title="Delete" className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
