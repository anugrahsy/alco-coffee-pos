"use client";

import { useState } from "react";
import { RiAddLine, RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { SoftScroll } from "@/components/application/layout/soft-scroll";

import type { PosCategory, PosProduct } from "./pos-types";

type CategoryKey = "all" | PosCategory;

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "minuman", label: "Minuman" },
  { key: "snack", label: "Snack" },
  { key: "makanan", label: "Makanan" },
];

// Contoh data — nanti diganti data produk dari server.
const PRODUCTS: PosProduct[] = [
  { id: "americano", name: "Americano", category: "minuman", price: 18000 },
  { id: "kopi-susu", name: "Kopi Susu", category: "minuman", price: 20000 },
  { id: "latte", name: "Latte", category: "minuman", price: 22000 },
  { id: "matcha-latte", name: "Matcha Latte", category: "minuman", price: 24000 },
  { id: "cookies", name: "Cookies Classic", category: "snack", price: 15000 },
  { id: "french-fries", name: "French Fries", category: "snack", price: 18000 },
  { id: "brownies", name: "Brownies", category: "snack", price: 20000 },
  { id: "nasi-goreng", name: "Nasi Goreng", category: "makanan", price: 28000 },
  { id: "chicken-rice", name: "Chicken Rice", category: "makanan", price: 30000 },
];

function formatRupiah(value: number) {
  return "Rp" + value.toLocaleString("id-ID");
}

export function PosProducts({
  onAdd,
}: {
  onAdd: (product: PosProduct) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");

  const filtered = PRODUCTS.filter((item) => {
    if (item.active === false) return false;
    const matchCategory = category === "all" || item.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || item.name.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background-pos-catalog">
      <div className="flex flex-col gap-4 p-4">
        <Input
          value={query}
          onChange={setQuery}
          leadingIcon={RiSearchLine}
          placeholder="Cari produk..."
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.key}
              variant={category === c.key ? "primary" : "secondary"}
              size="small"
              className="min-h-11"
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-body-regular text-text-tertiary">
          Tidak ada produk yang cocok.
        </div>
      ) : (
        <SoftScroll contentClassName="grid grid-cols-2 auto-rows-min content-start gap-4 p-4 pt-0 sm:grid-cols-3 xl:grid-cols-4" surface="var(--color-background-pos-catalog)">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-3xl bg-background-primary-default p-4 transition-shadow hover:shadow-card"
            >
              <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-background-secondary-default">
                <img
                  src="/products/contoh-coffee.jpeg"
                  alt={item.name}
                  className="size-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={240}
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-body-medium text-text-primary">
                  {item.name}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body-medium tabular-nums text-text-primary">
                    {formatRupiah(item.price)}
                  </span>
                  <Button
                    variant="primary"
                    size="small"
                    iconOnly
                    leadingIcon={RiAddLine}
                    className="min-h-11 min-w-11"
                    aria-label={`Tambah ${item.name}`}
                    disabled={item.available === false}
                    onClick={() => onAdd(item)}
                  />
                </div>
                {item.available === false && <span className="text-body-2-medium text-text-tertiary">Habis</span>}
              </div>
            </div>
          ))}
        </SoftScroll>
      )}
    </div>
  );
}
