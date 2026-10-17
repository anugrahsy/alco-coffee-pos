"use client";

import { useState } from "react";
import {
  RiArrowDownSLine,
  RiCoinsFill,
  RiDownload2Line,
  RiFileCodeLine,
  RiFileExcel2Line,
  RiLineChartFill,
  RiReceiptLine,
  RiShoppingBag3Line,
} from "@remixicon/react";
import { buttonStyles } from "@/components/base/buttons/button";
import { DateRangePicker } from "@/components/base/date-picker/date-range-picker";
import {
  Dropdown,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/base/dropdown/dropdown";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import { cx } from "@/utils/cx";
import { PageHeader } from "./page-header";
import { StatCards, type Stat } from "./stat-cards";
import { TopProductsCard } from "./top-products-card";
import { TransactionsTable } from "./transactions-table";

/* ---------------------------------------------------------------------------
 * Board UI → dashboard 1 (Home) → Penjualan. Sama persis dengan menu Home:
 * breadcrumb, 4 KPI card (Customers / Unit sold / Orders / Support tickets),
 * lalu tabel customers.
 * ------------------------------------------------------------------------- */

const PENJUALAN_STATS: Stat[] = [
  { icon: RiCoinsFill, label: "Total Omset", value: "Rp 56.800.000", delta: "+6.8%", deltaColor: "lime" },
  { icon: RiLineChartFill, label: "Laba Bersih", value: "Rp 19.460.000", delta: "+3.9%", deltaColor: "lime" },
  { icon: RiReceiptLine, label: "Jumlah Transaksi", value: "660", delta: "+5.3%", deltaColor: "lime" },
  { icon: RiShoppingBag3Line, label: "Jumlah Pesanan", value: "1.394", delta: "+12.8%", deltaColor: "lime" },
];

export function PenjualanHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader current="Penjualan" icon={RiShoppingBag3Line} />
        <div className="flex flex-col gap-0.5 px-1">
          <span className="text-title-2-medium text-text-primary">Penjualan</span>
          <span className="text-body-medium text-text-secondary">
            Ringkasan penjualan toko
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SegmentedControl defaultSelectedKeys={["today"]} aria-label="Periode">
            <SegmentedControlItem id="today" className="py-1.5">Hari ini</SegmentedControlItem>
            <SegmentedControlItem id="week" className="py-1.5">Minggu ini</SegmentedControlItem>
            <SegmentedControlItem id="month" className="py-1.5">Bulan ini</SegmentedControlItem>
            <SegmentedControlItem id="year" className="py-1.5">Tahun ini</SegmentedControlItem>
          </SegmentedControl>
          <div className="flex items-center gap-2">
            <DateRangePicker aria-label="Rentang tanggal" placeholder="Pilih tanggal" />
            <DownloadMenu />
          </div>
        </div>
      </header>

      <StatCards variant="plain" stats={PENJUALAN_STATS} />

      <TopProductsCard />

      <TransactionsTable />
    </div>
  );
}

/** Tombol unduh di pojok kanan judul Penjualan: primary + menu pilihan format. */
function DownloadMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      <DropdownTrigger
        className={cx(
          buttonStyles.base,
          buttonStyles.size.medium,
          buttonStyles.variant.primary,
        )}
      >
        <RiDownload2Line className={buttonStyles.icon.medium} aria-hidden />
        <span className={buttonStyles.label.medium}>Download</span>
        <RiArrowDownSLine className={buttonStyles.icon.medium} aria-hidden />
      </DropdownTrigger>
      <DropdownPopover aria-label="Download" placement="bottom end" className="w-[180px]">
        <DropdownItem onSelect={() => setOpen(false)}>
          <RiFileExcel2Line className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
          <span className="text-body-medium">Download Excel</span>
        </DropdownItem>
        <DropdownItem onSelect={() => setOpen(false)}>
          <RiFileCodeLine className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
          <span className="text-body-medium">Download CSV</span>
        </DropdownItem>
      </DropdownPopover>
    </Dropdown>
  );
}
