"use client";

import { useState } from "react";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiEyeLine,
  RiFolder3Line,
  RiSearchLine,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import { Switch } from "@/components/base/switch/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";

/* ---------------------------------------------------------------------------
 * Tabel kategori (Master Data). Kolom: Nama Kategori, Kode, Deskripsi, Jumlah
 * Produk, Active (switch), Actions (lihat + edit + hapus). Filter status +
 * search. Data masih mock, belum tersambung backend / POS.
 * ------------------------------------------------------------------------- */

export interface Kategori {
  code: string;
  name: string;
  description: string;
  productCount: number;
  active: boolean;
}

export const KATEGORIS: Kategori[] = [
  { code: "KTG001", name: "Coffee", description: "Minuman berbasis kopi", productCount: 4, active: true },
  { code: "KTG002", name: "Non Coffee", description: "Minuman non kopi", productCount: 3, active: true },
  { code: "KTG003", name: "Snack", description: "Makanan ringan", productCount: 3, active: true },
  { code: "KTG004", name: "Dessert", description: "Makanan penutup", productCount: 2, active: false },
  { code: "KTG005", name: "Main Course", description: "Makanan utama", productCount: 2, active: true },
  { code: "KTG006", name: "Add-ons", description: "Sirup, topping, tambahan", productCount: 1, active: false },
];

type StatusFilter = "Semua" | "Aktif" | "Nonaktif";

export function KategoriTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Semua");
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(KATEGORIS.map((kategori) => [kategori.code, kategori.active])),
  );

  const normalized = query.trim().toLocaleLowerCase();
  const filtered = KATEGORIS.filter((kategori) => {
    const isActive = active[kategori.code];
    const matchName =
      kategori.name.toLocaleLowerCase().includes(normalized) ||
      kategori.code.toLocaleLowerCase().includes(normalized);
    const matchStatus =
      status === "Semua" || (status === "Aktif" ? isActive : !isActive);
    return matchName && matchStatus;
  });

  return (
    <section className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
        <div className="flex h-10 flex-col justify-center">
          <span className="text-body-medium text-text-tertiary">Total Kategori</span>
          <span className="text-body-medium text-text-primary">
            {filtered.length} kategori
          </span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
          <Select
            selectedKey={status}
            onSelectionChange={(key) => setStatus(key as StatusFilter)}
            aria-label="Filter status kategori"
            renderValue="Status"
            className="w-[150px]"
          >
            {(["Semua", "Aktif", "Nonaktif"] as const).map((option) => (
              <SelectItem key={option} id={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Input
            placeholder="Search"
            aria-label="Search kategori"
            value={query}
            onChange={setQuery}
            leadingIcon={RiSearchLine}
            className="min-w-[153px] flex-1 sm:w-[153px] sm:min-w-0 sm:flex-none"
            fieldClassName="rounded-full bg-background-secondary-default"
            inputClassName="text-body-medium"
          />
        </div>
      </div>

      <Table aria-label="Kategori" className="min-w-[900px]">
        <TableHeader>
          <TableColumn id="name" isRowHeader className="w-[200px]">
            Nama Kategori
          </TableColumn>
          <TableColumn id="code" className="w-[130px]">
            Kode
          </TableColumn>
          <TableColumn id="description" className="w-[240px]">
            Deskripsi
          </TableColumn>
          <TableColumn id="productCount" className="w-[140px]">
            Jumlah Produk
          </TableColumn>
          <TableColumn id="active" className="w-[120px]">
            Active
          </TableColumn>
          <TableColumn id="actions" className="w-[150px]">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody renderEmptyState={() => <span className="text-body-regular text-text-tertiary">Tidak ada kategori yang cocok.</span>}>
          {filtered.map((kategori) => (
              <TableRow key={kategori.code} id={kategori.code}>
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-body-medium text-text-primary">
                    <RiFolder3Line className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
                    <span className="whitespace-nowrap">{kategori.name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-secondary">{kategori.code}</span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-secondary">
                    {kategori.description}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip variant="subtle" color="gray">
                    {kategori.productCount} produk
                  </Chip>
                </TableCell>
                <TableCell>
                  <Switch
                    size="sm"
                    isSelected={active[kategori.code]}
                    onChange={(on) =>
                      setActive((map) => ({ ...map, [kategori.code]: on }))
                    }
                    aria-label={`Aktifkan ${kategori.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2.5">
                    <IconButton
                      icon={RiEyeLine}
                      size="small"
                      aria-label={`Lihat ${kategori.name}`}
                    />
                    <IconButton
                      icon={RiEdit2Line}
                      size="small"
                      aria-label={`Edit ${kategori.name}`}
                    />
                    <IconButton
                      icon={RiDeleteBin6Line}
                      size="small"
                      aria-label={`Hapus ${kategori.name}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="mt-3 px-3">
        <Pagination page={page} totalPages={1} onChange={setPage} />
      </div>
    </section>
  );
}
