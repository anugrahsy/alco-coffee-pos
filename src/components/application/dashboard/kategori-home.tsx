"use client";

import {
  RiAddLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiFolder3Line,
  RiPriceTag3Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { PageHeader } from "./page-header";
import { KategoriTable, KATEGORIS } from "./kategori-table";
import { StatCards, type Stat } from "./stat-cards";

/* ---------------------------------------------------------------------------
 * Menu Kategori (Master Data). Susunan: breadcrumb + judul, KPI card ringkasan
 * kategori (BoardUI StatCards plain), lalu tabel kategori.
 * ------------------------------------------------------------------------- */

const activeCount = KATEGORIS.filter((kategori) => kategori.active).length;
const inactiveCount = KATEGORIS.length - activeCount;
const productTotal = KATEGORIS.reduce((sum, kategori) => sum + kategori.productCount, 0);

const KATEGORI_STATS: Stat[] = [
  {
    icon: RiFolder3Line,
    label: "Total Kategori",
    value: String(KATEGORIS.length),
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
    label: "Produk Terkategori",
    value: String(productTotal),
    delta: "0",
    deltaColor: "neutral",
  },
];

export function KategoriHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader current="Kategori" icon={RiFolder3Line} />
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 px-1">
            <span className="text-title-2-medium text-text-primary">Kategori</span>
            <span className="text-body-medium text-text-secondary">
              Kelola kategori produk di POS
            </span>
          </div>
          <Button variant="primary" size="medium" leadingIcon={RiAddLine}>
            Tambah Kategori
          </Button>
        </div>
      </header>

      <StatCards variant="plain" stats={KATEGORI_STATS} />

      <KategoriTable />
    </div>
  );
}
