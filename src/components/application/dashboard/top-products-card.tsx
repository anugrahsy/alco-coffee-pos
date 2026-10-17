"use client";

import { Avatar } from "@/components/base/avatar/avatar";

type AvatarColor = "neutral" | "blue" | "lime" | "pink";

interface TopProduct {
  name: string;
  initials: string;
  color: AvatarColor;
  sold: string;
  price: string;
}

const TOP_PRODUCTS: TopProduct[] = [
  { name: "Caramel Machiato", initials: "C", color: "lime", sold: "4 terjual", price: "Rp 120.000" },
  { name: "Espresso", initials: "E", color: "blue", sold: "3 terjual", price: "Rp 90.000" },
  { name: "Caffe Latte", initials: "L", color: "pink", sold: "2 terjual", price: "Rp 64.000" },
  { name: "Croissant", initials: "C", color: "neutral", sold: "5 terjual", price: "Rp 125.000" },
  { name: "Nasi Bowl", initials: "N", color: "blue", sold: "1 terjual", price: "Rp 50.000" },
  { name: "Americano", initials: "A", color: "neutral", sold: "2 terjual", price: "Rp 40.000" },
  { name: "Hot Chocolate", initials: "H", color: "pink", sold: "1 terjual", price: "Rp 32.000" },
];

/**
 * Daftar produk terlaris (jumlah pesanan). Deretan kartu produk (avatar, nama,
 * "N terjual", harga), scroll horizontal dengan scrollbar disembunyikan.
 */
export function TopProductsCard() {
  return (
    <section className="flex min-w-0 flex-col rounded-2xl bg-background-secondary-default p-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-none">
        {TOP_PRODUCTS.map((product) => (
          <div
            key={product.name}
            className="flex h-[104px] min-w-40 w-[calc((100%-4rem)/5)] shrink-0 flex-col justify-between rounded-2lg bg-background-primary-default p-4 shadow-card lg:min-w-0"
          >
            <div className="flex items-center gap-2">
              <Avatar size="lg" color={product.color} initials={product.initials} />
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="truncate text-body-medium text-text-primary">
                  {product.name}
                </span>
                <span className="truncate text-body-2-medium text-text-secondary">
                  {product.sold}
                </span>
              </div>
            </div>
            <div className="flex h-6 w-full items-center justify-center rounded-md bg-background-secondary-default px-1.5">
              <span className="text-caption-1-medium text-text-secondary">
                {product.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
