"use client";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/dashboard";

const TYPE_COLORS: Record<string, string> = {
  payment_received: "text-emerald-400 bg-emerald-500/10",
  invoice_sent:     "text-blue-400 bg-blue-500/10",
  project_update:   "text-purple-400 bg-purple-500/10",
  message:          "text-cyan-400 bg-cyan-500/10",
  file_uploaded:    "text-yellow-400 bg-yellow-500/10",
  milestone:        "text-pink-400 bg-pink-500/10",
};

const TYPE_LABELS: Record<string, string> = {
  payment_received: "Payment",
  invoice_sent:     "Invoice",
  project_update:   "Project",
  message:          "Message",
  file_uploaded:    "File",
  milestone:        "Milestone",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifs = () =>
    fetch("/api/admin/notifications")
      .then(r => r.json())
      .then(d => { if (d.success) setNotifs(d.data); })
      .finally(() => setLoading(false));

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (ids: number[]) => {
    await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifs(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: 1 } : n));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setMarkingAll(false);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Notifications</h1>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-200 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <BellOff className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <m.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200",
                n.is_read
                  ? "bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-100"
                  : "bg-white/[0.04] border-white/[0.08]"
              )}
            >
              {/* Icon */}
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", TYPE_COLORS[n.type] ?? "text-gray-400 bg-white/5")}>
                <Bell className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", TYPE_COLORS[n.type] ?? "text-gray-400 bg-white/5")}>
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  {!n.is_read && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />}
                </div>
                <p className="text-white text-sm font-medium mb-0.5">{n.title}</p>
                <p className="text-gray-500 text-xs">{n.body}</p>
                <p className="text-gray-600 text-xs mt-1">{timeAgo(n.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {n.link && (
                  <Link href={n.link}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => markRead([n.id])}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </m.div>
          ))}
        </div>
      )}
    </div>
  );
}
