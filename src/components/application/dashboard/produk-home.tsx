"use client";

import {
  RiAddLine,
  RiBox3Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiPriceTag3Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { PageHeader } from "./page-header";
import { ProdukTable, PRODUKS } from "./produk-table";
import { StatCards, type Stat } from "./stat-cards";

/* ---------------------------------------------------------------------------
 * Menu Produk (Master Data). Susunan: breadcrumb + judul, KPI card ringkasan
 * produk (BoardUI StatCards plain), lalu tabel produk.
 * ------------------------------------------------------------------------- */

const activeCount = PRODUKS.filter((produk) => produk.active).length;
const inactiveCount = PRODUKS.length - activeCount;

const PRODUK_STATS: Stat[] = [
  {
    icon: RiBox3Line,
    label: "Total Produk",
    value: String(PRODUKS.length),
    delta: "+2",
    deltaColor: "lime",
  },
  {
    icon: RiCheckboxCircleLine,
    label: "Aktif",
    value: String(activeCount),
    delta: "+1",
    deltaColor: "lime",
  },
  {
    icon: RiCloseCircleLine,
    label: "Nonaktif",
    value: String(inactiveCount),
    delta: "-1",
    deltaColor: "rose",
  },
  {
    icon: RiPriceTag3Line,
    label: "Kategori",
    value: "3",
    delta: "0",
    deltaColor: "neutral",
  },
];

export function ProdukHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader current="Produk" icon={RiBox3Line} />
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 px-1">
            <span className="text-title-2-medium text-text-primary">Produk</span>
            <span className="text-body-medium text-text-secondary">
              Kelola produk dan status jual di POS
            </span>
          </div>
          <Button variant="primary" size="medium" leadingIcon={RiAddLine}>
            Tambah Produk
          </Button>
        </div>
      </header>

      <StatCards variant="plain" stats={PRODUK_STATS} />

      <ProdukTable />
    </div>
  );
}
