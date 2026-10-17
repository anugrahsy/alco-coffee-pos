"use client";

import { useState } from "react";
import { PosSidebar } from "./pos-sidebar";
import { PosProducts } from "./pos-products";
import { PosCart } from "./pos-cart";
import type { PosCartItem, PosProduct } from "./pos-types";

export function PosLayout() {
  const [cart, setCart] = useState<PosCartItem[]>([]);

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
    <div className="flex h-screen overflow-hidden bg-background-full">
      {/* Kiri: sidebar POS */}
      <PosSidebar defaultCollapsed />

      {/* Tengah: katalog produk */}
      <main className="flex min-w-0 flex-1 flex-col">
        <PosProducts onAdd={addToCart} />
      </main>

      {/* Kanan: keranjang */}
      <aside className="flex w-[420px] shrink-0 flex-col border-s border-separator-border bg-background-primary-default">
        <PosCart
          cart={cart}
          onChangeQuantity={changeQuantity}
          onRemove={removeItem}
        />
      </aside>
    </div>
  );
}
