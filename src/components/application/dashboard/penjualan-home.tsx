"use client";

import {
  RiBox3Line,
  RiGroupLine,
  RiMessage2Line,
  RiShoppingBag3Line,
} from "@remixicon/react";
import { PageHeader } from "./page-header";
import { StatCards, type Stat } from "./stat-cards";
import { CustomersTable } from "./customers-table";

/* ---------------------------------------------------------------------------
 * Board UI → dashboard 1 (Home) → Penjualan. Sama persis dengan menu Home:
 * breadcrumb, 4 KPI card (Customers / Unit sold / Orders / Support tickets),
 * lalu tabel customers.
 * ------------------------------------------------------------------------- */

const PENJUALAN_STATS: Stat[] = [
  { icon: RiGroupLine, label: "Customers", value: "14,592", delta: "+5.3%", deltaColor: "lime" },
  { icon: RiBox3Line, label: "Unit sold", value: "385", delta: "-2.1%", deltaColor: "rose" },
  { icon: RiShoppingBag3Line, label: "Orders", value: "1,394", delta: "0.00%", deltaColor: "neutral" },
  { icon: RiMessage2Line, label: "Support tickets", value: "708", delta: "+12.8%", deltaColor: "lime" },
];

export function PenjualanHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader current="Penjualan" icon={RiShoppingBag3Line} />
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 px-1">
            <span className="text-title-2-medium text-text-primary">Penjualan</span>
            <span className="text-body-medium text-text-secondary">
              Ringkasan penjualan toko
            </span>
          </div>
        </div>
      </header>

      <StatCards variant="plain" stats={PENJUALAN_STATS} />

      <CustomersTable />
    </div>
  );
}
