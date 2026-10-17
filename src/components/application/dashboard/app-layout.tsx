"use client";

import { useLocation } from "@tanstack/react-router";
import { DashboardSidebar } from "./dashboard-sidebar";

/** Shared app frame: sticky sidebar + scrollable content. Used by every `_protected` page. */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: (s) => s.pathname });
  const selected = pathname.startsWith("/monitor")
    ? "monitor"
    : pathname.startsWith("/penjualan")
      ? "penjualan"
      : "home";

  return (
    <div className="flex min-h-screen bg-background-full">
      <div className="sticky top-0 h-screen shrink-0 p-3">
        <DashboardSidebar selected={selected} showThemeToggle={false} />
      </div>
      <main className="min-w-0 flex-1 p-4">{children}</main>
    </div>
  );
}
