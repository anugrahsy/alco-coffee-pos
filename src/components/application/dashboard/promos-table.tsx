"use client";

import { useState } from "react";
import {
  RiCoinsLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiEyeLine,
  RiPercentLine,
  RiSearchLine,
  RiTicket2Line,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";

/* ---------------------------------------------------------------------------
 * Tabel promo. Kolom: Nama Promo, Periode, Potongan, Status (Live / Pending /
 * Expired), Actions (edit + hapus). Diatas tabel: total promo, filter status,
 * search, dan tombol Tambah Promo. Data masih mock, belum tersambung backend.
 * ------------------------------------------------------------------------- */

export type PromoStatus = "Live" | "Pending" | "Expired";
export type PromoType = "Persen" | "Nominal";

export interface Promo {
  id: string;
  name: string;
  start: string;
  end: string;
  discount: string;
  type: PromoType;
  minSpend: string;
  terms: string;
  status: PromoStatus;
}

export const PROMOS: Promo[] = [
  { id: "#PRM001", name: "Diskon Akhir Pekan", start: "17 Okt 2026", end: "19 Okt 2026", discount: "20%", type: "Persen", minSpend: "Rp 50.000", terms: "Min. 2 item", status: "Live" },
  { id: "#PRM002", name: "Buy 1 Get 1", start: "1 Okt 2026", end: "31 Okt 2026", discount: "50%", type: "Persen", minSpend: "Rp 100.000", terms: "Tanpa syarat", status: "Live" },
  { id: "#PRM003", name: "Gratis Ongkir", start: "15 Okt 2026", end: "18 Okt 2026", discount: "Rp 15.000", type: "Nominal", minSpend: "Rp 30.000", terms: "Pembelian pertama", status: "Live" },
  { id: "#PRM004", name: "Diskon Member Baru", start: "1 Nov 2026", end: "30 Nov 2026", discount: "10%", type: "Persen", minSpend: "Rp 75.000", terms: "Member baru", status: "Pending" },
  { id: "#PRM005", name: "Happy Hour 50%", start: "20 Okt 2026", end: "20 Okt 2026", discount: "50%", type: "Persen", minSpend: "Rp 50.000", terms: "Jam 17.00 - 19.00", status: "Pending" },
  { id: "#PRM006", name: "Promo Lebaran", start: "1 Mar 2026", end: "7 Mar 2026", discount: "30%", type: "Persen", minSpend: "Rp 150.000", terms: "Tanpa syarat", status: "Expired" },
  { id: "#PRM007", name: "Diskon Kopi Pagi", start: "10 Sep 2026", end: "12 Sep 2026", discount: "15%", type: "Persen", minSpend: "Rp 25.000", terms: "Jam 06.00 - 09.00", status: "Expired" },
  { id: "#PRM008", name: "Promo 17 Agustus", start: "15 Agu 2026", end: "20 Agu 2026", discount: "17%", type: "Persen", minSpend: "Rp 100.000", terms: "Tanpa syarat", status: "Expired" },
];

const TYPE_ICON: Record<PromoType, typeof RiPercentLine> = {
  Persen: RiPercentLine,
  Nominal: RiCoinsLine,
};

const STATUS_CHIP: Record<PromoStatus, "lime" | "yellow" | "rose"> = {
  Live: "lime",
  Pending: "yellow",
  Expired: "rose",
};

type StatusFilter = "Semua" | PromoStatus;
type TypeFilter = "Semua" | PromoType;

/** Label nama promo dengan ikon tiket. */
function PromoName({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-body-medium text-text-primary">
      <RiTicket2Line className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
      <span className="whitespace-nowrap">{name}</span>
    </span>
  );
}

/** Label jenis promo dengan ikon di kiri: Persen / Nominal. */
function PromoTypeLabel({ type }: { type: PromoType }) {
  const Icon = TYPE_ICON[type];
  return (
    <span className="inline-flex items-center gap-2 text-body-medium text-text-primary">
      <Icon className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
      <span className="whitespace-nowrap">{type}</span>
    </span>
  );
}

export function PromosTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Semua");
  const [type, setType] = useState<TypeFilter>("Semua");

  const normalized = query.trim().toLocaleLowerCase();
  const filtered = PROMOS.filter((promo) => {
    const matchName = promo.name.toLocaleLowerCase().includes(normalized);
    const matchStatus = status === "Semua" || promo.status === status;
    const matchType = type === "Semua" || promo.type === type;
    return matchName && matchStatus && matchType;
  });

  return (
    <section className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
        <div className="flex h-10 flex-col justify-center">
          <span className="text-body-medium text-text-tertiary">Total Promo</span>
          <span className="text-body-medium text-text-primary">
            {filtered.length} promo
          </span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
          <Select
            selectedKey={type}
            onSelectionChange={(key) => setType(key as TypeFilter)}
            aria-label="Filter jenis promo"
            renderValue="Jenis"
            className="w-[140px]"
          >
            {(["Semua", "Persen", "Nominal"] as const).map((option) => (
              <SelectItem key={option} id={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Select
            selectedKey={status}
            onSelectionChange={(key) => setStatus(key as StatusFilter)}
            aria-label="Filter status promo"
            renderValue="Status"
            className="w-[150px]"
          >
            {(["Semua", "Live", "Pending", "Expired"] as const).map((option) => (
              <SelectItem key={option} id={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Input
            placeholder="Search"
            aria-label="Search promo"
            value={query}
            onChange={setQuery}
            leadingIcon={RiSearchLine}
            className="min-w-[153px] flex-1 sm:w-[153px] sm:min-w-0 sm:flex-none"
            fieldClassName="rounded-full bg-background-secondary-default"
            inputClassName="text-body-medium"
          />
        </div>
      </div>

      <Table aria-label="Promo" className="min-w-[1350px]">
        <TableHeader>
          <TableColumn id="name" isRowHeader className="w-[220px]">
            Nama Promo
          </TableColumn>
          <TableColumn id="period" className="w-[220px]">
            Periode
          </TableColumn>
          <TableColumn id="discount" className="w-[140px]">
            Potongan
          </TableColumn>
          <TableColumn id="type" className="w-[140px]">
            Jenis
          </TableColumn>
          <TableColumn id="minSpend" className="w-[150px]">
            Min. Belanja
          </TableColumn>
          <TableColumn id="terms" className="w-[180px]">
            Syarat Kupon
          </TableColumn>
          <TableColumn id="status" className="w-[140px]">
            Status
          </TableColumn>
          <TableColumn id="actions" className="w-[150px]">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody renderEmptyState={() => <span className="text-body-regular text-text-tertiary">Tidak ada promo yang cocok.</span>}>
          {filtered.map((promo) => (
              <TableRow key={promo.id} id={promo.id}>
                <TableCell>
                  <PromoName name={promo.name} />
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-primary">
                    {promo.start} - {promo.end}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip variant="subtle" color="gray">
                    {promo.discount}
                  </Chip>
                </TableCell>
                <TableCell>
                  <PromoTypeLabel type={promo.type} />
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-primary">{promo.minSpend}</span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-secondary">{promo.terms}</span>
                </TableCell>
                <TableCell>
                  <Chip variant="bold" color={STATUS_CHIP[promo.status]}>
                    {promo.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2.5">
                    <IconButton
                      icon={RiEyeLine}
                      size="small"
                      aria-label={`Lihat ${promo.name}`}
                    />
                    <IconButton
                      icon={RiEdit2Line}
                      size="small"
                      aria-label={`Edit ${promo.name}`}
                    />
                    <IconButton
                      icon={RiDeleteBin6Line}
                      size="small"
                      aria-label={`Hapus ${promo.name}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="mt-3 px-3">
        <Pagination page={page} totalPages={5} onChange={setPage} />
      </div>
    </section>
  );
}
