"use client";

import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PosSidebar } from "./pos-sidebar";
import { PosProducts } from "./pos-products";
import { PosCart } from "./pos-cart";
import { PosSavedOrders } from "./pos-saved-orders";
import type { PosCartItem, PosProduct } from "./pos-types";
import { Button } from "@/components/base/buttons/button";
import { RiCloseLine, RiMenuLine, RiShoppingBag3Line } from "@remixicon/react";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";

export function PosLayout() {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { view } = useSearch({ from: "/_protected/pos" });
  const showSaved = view === "simpan-pesanan";

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return [item];
        const quantity = item.quantity + delta;
        return quantity <= 0 ? [] : [{ ...item, quantity }];
      }),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background-full">
      {/* Kiri: sidebar POS */}
      <div className="hidden h-full shrink-0 lg:block">
      <PosSidebar
        defaultCollapsed
        selected={showSaved ? "simpan-pesanan" : "kasir"}
        onSelectKasir={() => navigate({ to: "/pos", search: {} })}
        onSelectSavedOrders={() =>
          navigate({ to: "/pos", search: { view: "simpan-pesanan" } })
        }
      />
      </div>
      <ResponsiveDrawer isOpen={menuOpen} onOpenChange={setMenuOpen} label="Navigasi POS">
        <PosSidebar mobile fluid selected={showSaved ? "simpan-pesanan" : "kasir"} onClose={() => setMenuOpen(false)} onSelectKasir={() => { setMenuOpen(false); void navigate({ to: '/pos', search: {} }); }} onSelectSavedOrders={() => { setMenuOpen(false); void navigate({ to: '/pos', search: { view: 'simpan-pesanan' } }); }} />
      </ResponsiveDrawer>

      {/* Tengah: katalog produk / simpan pesanan */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border bg-background-primary-default p-3 lg:hidden">
          <Button variant="secondary" iconOnly leadingIcon={RiMenuLine} aria-label="Buka navigasi POS" className="min-h-11 min-w-11" onClick={() => setMenuOpen(true)} />
          <Button variant="secondary" leadingIcon={RiShoppingBag3Line} className="min-h-11" onClick={() => setCartOpen(true)}>Keranjang ({cart.reduce((sum, item) => sum + item.quantity, 0)})</Button>
        </div>
        {showSaved ? (
          <PosSavedOrders />
        ) : (
          <PosProducts onAdd={addToCart} />
        )}
      </main>

      {/* Kanan: keranjang */}
      <aside className="hidden w-[420px] shrink-0 flex-col border-s border-separator-border bg-background-primary-default lg:flex">
        <PosCart
          cart={cart}
          onChangeQuantity={changeQuantity}
          onRemove={removeItem}
        />
      </aside>
      <ResponsiveDrawer isOpen={cartOpen} onOpenChange={setCartOpen} label="Keranjang POS" side="end">
        <div className="flex shrink-0 justify-end border-b border-separator-border p-2"><Button variant="ghost" leadingIcon={RiCloseLine} aria-label="Tutup keranjang" className="min-h-11" onClick={() => setCartOpen(false)}>Tutup</Button></div>
        <PosCart cart={cart} onChangeQuantity={changeQuantity} onRemove={removeItem} />
      </ResponsiveDrawer>
    </div>
  );
}
