"use client";

import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { DashboardSidebar } from "./dashboard-sidebar";

/** Shared app frame: sticky sidebar + scrollable content. Used by every `_protected` page. */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useLocation({ select: (s) => s.pathname });
  useEffect(() => setMenuOpen(false), [pathname]);
  const selected = pathname.startsWith("/monitor")
    ? "monitor"
    : pathname.startsWith("/penjualan")
      ? "penjualan"
      : pathname.startsWith("/promo")
        ? "promo"
        : pathname.startsWith("/kategori")
          ? "kategori"
          : pathname.startsWith("/produk")
            ? "produk"
            : "home";

  return (
    <div className="flex min-h-screen bg-background-full">
      <div className="sticky top-0 hidden h-dvh shrink-0 p-3 lg:block">
        <DashboardSidebar selected={selected} showThemeToggle={false} />
      </div>
      <ResponsiveDrawer isOpen={menuOpen} onOpenChange={setMenuOpen} label="Navigasi Dashboard">
        <DashboardSidebar mobile fluid selected={selected} onClose={() => setMenuOpen(false)} showThemeToggle={false} />
      </ResponsiveDrawer>
      <main className="min-w-0 flex-1 p-4">
        <div className="mb-3 lg:hidden"><Button variant="secondary" iconOnly leadingIcon={RiMenuLine} aria-label="Buka navigasi" className="min-h-11 min-w-11" onClick={() => setMenuOpen(true)} /></div>
        {children}
      </main>
    </div>
  );
}
