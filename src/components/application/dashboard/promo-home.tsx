"use client";

import {
  RiAddLine,
  RiHistoryLine,
  RiSparklingLine,
  RiTicket2Line,
  RiTimeLine,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { PageHeader } from "./page-header";
import { PromosTable, PROMOS } from "./promos-table";
import { StatCards, type Stat } from "./stat-cards";

/* ---------------------------------------------------------------------------
 * Menu Promo. Susunan: breadcrumb + judul, KPI card ringkasan promo (BoardUI
 * StatCards footer), lalu tabel promo (search, filter jenis + status, tombol
 * Tambah Promo, edit/hapus).
 * ------------------------------------------------------------------------- */

const live = PROMOS.filter((promo) => promo.status === "Live").length;
const pending = PROMOS.filter((promo) => promo.status === "Pending").length;
const expired = PROMOS.filter((promo) => promo.status === "Expired").length;

const PROMO_STATS: Stat[] = [
  {
    icon: RiTicket2Line,
    label: "Total Promo",
    value: String(PROMOS.length),
    delta: "+3",
    deltaColor: "lime",
  },
  {
    icon: RiSparklingLine,
    label: "Aktif",
    value: String(live),
    delta: "+1",
    deltaColor: "lime",
  },
  {
    icon: RiTimeLine,
    label: "Pending",
    value: String(pending),
    delta: "0",
    deltaColor: "neutral",
  },
  {
    icon: RiHistoryLine,
    label: "Expired",
    value: String(expired),
    delta: "-1",
    deltaColor: "rose",
  },
];

export function PromoHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader current="Promo" icon={RiTicket2Line} />
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 px-1">
            <span className="text-title-2-medium text-text-primary">Promo</span>
            <span className="text-body-medium text-text-secondary">
              Kelola promo dan diskon toko
            </span>
          </div>
          <Button variant="primary" size="medium" leadingIcon={RiAddLine}>
            Tambah Promo
          </Button>
        </div>
      </header>

      <StatCards variant="plain" stats={PROMO_STATS} />

      <PromosTable />
    </div>
  );
}
