"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, FileText, CreditCard,
  MessageSquare, BookOpen, Image, Star, Settings, LogOut,
  Zap, ChevronRight, Bell, Menu, X, Briefcase, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/GradientText";

const navItems = [
  { label: "Dashboard",    href: "/admin",             icon: LayoutDashboard },
  { label: "Clients",      href: "/admin/clients",      icon: Users },
  { label: "Projects",     href: "/admin/projects",     icon: FolderKanban },
  { label: "Invoices",     href: "/admin/invoices",     icon: FileText },
  { label: "Quotations",   href: "/admin/quotations",   icon: ClipboardList },
  { label: "Payments",     href: "/admin/payments",     icon: CreditCard },
  { label: "Submissions",  href: "/admin/submissions",  icon: MessageSquare },
  { divider: true },
  { label: "Blog",         href: "/admin/blog",         icon: BookOpen },
  { label: "Portfolio",    href: "/admin/portfolio",    icon: Image },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Services",     href: "/admin/services",     icon: Briefcase },
];

interface Props { unreadCount?: number; collapsed?: boolean; onToggle?: () => void }

export function AdminSidebar({ unreadCount = 0, collapsed: collapsedProp, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = collapsedProp ?? collapsedInternal;
  const setCollapsed = onToggle ?? (() => setCollapsedInternal(v => !v));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm text-white whitespace-nowrap">
            Admin <GradientText>Panel</GradientText>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if ("divider" in item) return (
            <div key={i} className="h-px bg-white/[0.06] my-3 mx-2" />
          );
          const Icon = item.icon!;
          const active = isActive(item.href!);
          return (
            <Link key={item.href} href={item.href!}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "text-white bg-purple-500/20 border border-purple-500/30"
                  : "text-gray-500 hover:text-white hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}>
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-200",
                active ? "text-purple-400" : "group-hover:scale-110")} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto text-purple-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-white/[0.06] p-3 space-y-1", collapsed && "px-2")}>
        <Link href="/admin/notifications"
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200 relative", collapsed && "justify-center")}>
          <Bell className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/admin/settings"
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200", collapsed && "justify-center")}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button onClick={handleLogout}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200", collapsed && "justify-center")}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[#08081a] border-r border-white/[0.06] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex flex-col h-full overflow-hidden">
          <SidebarContent />
        </div>
        <button
          onClick={() => setCollapsed()}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#08081a] border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10 shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 rotate-180" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#08081a] border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">Admin</span>
        </Link>
        <button onClick={() => setMobileOpen(v => !v)} className="text-gray-400 hover:text-white p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <m.div className="fixed left-0 top-14 bottom-0 z-40 w-64 bg-[#08081a] border-r border-white/[0.06] lg:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <SidebarContent />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
