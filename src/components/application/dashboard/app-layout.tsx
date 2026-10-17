"use client";

import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import { DashboardSidebar } from "./dashboard-sidebar";

/** Viewport-bound frame: the sidebar stays still; only the main pane scrolls. */
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
    <div className="flex h-dvh overflow-hidden bg-background-full">
      <div className="hidden h-full shrink-0 p-3 lg:block">
        <DashboardSidebar selected={selected} showThemeToggle={false} />
      </div>
      <ResponsiveDrawer isOpen={menuOpen} onOpenChange={setMenuOpen} label="Navigasi Dashboard">
        <DashboardSidebar mobile fluid selected={selected} onClose={() => setMenuOpen(false)} showThemeToggle={false} />
      </ResponsiveDrawer>
      <SoftScroll contentClassName="flex-1" surface="var(--color-background-full)">
        <main className="min-w-0 p-4">
          <div className="mb-3 lg:hidden"><Button variant="secondary" iconOnly leadingIcon={RiMenuLine} aria-label="Buka navigasi" className="min-h-11 min-w-11" onClick={() => setMenuOpen(true)} /></div>
          {children}
        </main>
      </SoftScroll>
    </div>
  );
}
