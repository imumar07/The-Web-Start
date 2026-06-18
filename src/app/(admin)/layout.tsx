"use client";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#04040a]">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={cn(
        "transition-[padding-left] duration-300 pt-14 lg:pt-0",
        collapsed ? "lg:pl-16" : "lg:pl-60"
      )}>
        {children}
      </div>
    </div>
  );
}
