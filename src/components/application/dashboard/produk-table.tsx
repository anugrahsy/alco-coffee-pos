"use client";

import { useState, type ComponentType } from "react";
import {
  RiCakeLine,
  RiCupLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiEyeLine,
  RiLeafLine,
  RiSearchLine,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { Checkbox } from "@/components/base/checkbox/checkbox";
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
 * Tabel produk. Kolom: checkbox seleksi, Foto Produk (thumbnail rounded-xl),
 * Nama Produk, Kode Produk, Kategori, Harga Jual, Modal, Active (switch).
 * Filter kategori + status aktif/nonaktif + search, tombol Tambah Produk.
 * Data masih mock, belum tersambung backend / POS.
 * ------------------------------------------------------------------------- */

export type Category = "Coffee" | "Non Coffee" | "Snack";

export interface Produk {
  code: string;
  name: string;
  category: Category;
  price: string;
  cost: string;
  active: boolean;
}

export const PRODUKS: Produk[] = [
  { code: "KDP001", name: "Espresso", category: "Coffee", price: "Rp 30.000", cost: "Rp 12.000", active: true },
  { code: "KDP002", name: "Caffe Latte", category: "Coffee", price: "Rp 35.000", cost: "Rp 14.000", active: true },
  { code: "KDP003", name: "Americano", category: "Coffee", price: "Rp 25.000", cost: "Rp 9.000", active: true },
  { code: "KDP004", name: "Cappuccino", category: "Coffee", price: "Rp 38.000", cost: "Rp 15.000", active: true },
  { code: "KDP005", name: "Matcha Latte", category: "Non Coffee", price: "Rp 32.000", cost: "Rp 13.000", active: true },
  { code: "KDP006", name: "Ice Tea", category: "Non Coffee", price: "Rp 15.000", cost: "Rp 5.000", active: true },
  { code: "KDP007", name: "Chocolate", category: "Non Coffee", price: "Rp 30.000", cost: "Rp 11.000", active: false },
  { code: "KDP008", name: "Croissant", category: "Snack", price: "Rp 25.000", cost: "Rp 10.000", active: true },
  { code: "KDP009", name: "Cheese Cake", category: "Snack", price: "Rp 42.000", cost: "Rp 18.000", active: true },
  { code: "KDP010", name: "Cookies", category: "Snack", price: "Rp 20.000", cost: "Rp 8.000", active: false },
];

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const CATEGORY_CHIP: Record<Category, "blue" | "lime" | "yellow"> = {
  Coffee: "blue",
  "Non Coffee": "lime",
  Snack: "yellow",
};

const CATEGORY_ICON: Record<Category, IconComponent> = {
  Coffee: RiCupLine,
  "Non Coffee": RiLeafLine,
  Snack: RiCakeLine,
};

type CategoryFilter = "Semua" | Category;
type StatusFilter = "Semua" | "Aktif" | "Nonaktif";

/** Thumbnail foto produk: tile rounded-xl dengan ikon kategori. */
function ProductPhoto({ category }: { category: Category }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-tertiary-default">
      <Icon className="size-5 text-foreground-icon-secondary" aria-hidden />
    </span>
  );
}

export function ProdukTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Semua");
  const [status, setStatus] = useState<StatusFilter>("Semua");
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRODUKS.map((produk) => [produk.code, produk.active])),
  );

  const normalized = query.trim().toLocaleLowerCase();
  const filtered = PRODUKS.filter((produk) => {
    const isActive = active[produk.code];
    const matchName =
      produk.name.toLocaleLowerCase().includes(normalized) ||
      produk.code.toLocaleLowerCase().includes(normalized);
    const matchCategory = category === "Semua" || produk.category === category;
    const matchStatus =
      status === "Semua" ||
      (status === "Aktif" ? isActive : !isActive);
    return matchName && matchCategory && matchStatus;
  });

  return (
    <section className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
        <div className="flex h-10 flex-col justify-center">
          <span className="text-body-medium text-text-tertiary">Total Produk</span>
          <span className="text-body-medium text-text-primary">
            {filtered.length} produk
          </span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
          <Select
            selectedKey={category}
            onSelectionChange={(key) => setCategory(key as CategoryFilter)}
            aria-label="Filter kategori produk"
            renderValue="Kategori"
            className="w-[140px]"
          >
            {(["Semua", "Coffee", "Non Coffee", "Snack"] as const).map((option) => (
              <SelectItem key={option} id={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Select
            selectedKey={status}
            onSelectionChange={(key) => setStatus(key as StatusFilter)}
            aria-label="Filter status produk"
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
            aria-label="Search produk"
            value={query}
            onChange={setQuery}
            leadingIcon={RiSearchLine}
            className="min-w-[153px] flex-1 sm:w-[153px] sm:min-w-0 sm:flex-none"
            fieldClassName="rounded-full bg-background-secondary-default"
            inputClassName="text-body-medium"
          />
        </div>
      </div>

      <Table aria-label="Produk" className="min-w-[1100px]">
        <TableHeader>
          <TableColumn id="select" className="w-[48px]">
            <Checkbox slot="selection" size="sm" isIndeterminate defaultSelected aria-label="Pilih semua produk" />
          </TableColumn>
          <TableColumn id="photo" className="w-[80px]">
            Foto
          </TableColumn>
          <TableColumn id="name" isRowHeader className="w-[200px]">
            Nama Produk
          </TableColumn>
          <TableColumn id="code" className="w-[120px]">
            Kode Produk
          </TableColumn>
          <TableColumn id="category" className="w-[140px]">
            Kategori
          </TableColumn>
          <TableColumn id="price" className="w-[130px]">
            Harga Jual
          </TableColumn>
          <TableColumn id="cost" className="w-[120px]">
            Modal
          </TableColumn>
          <TableColumn id="active" className="w-[120px]">
            Active
          </TableColumn>
          <TableColumn id="actions" className="w-[150px]">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody renderEmptyState={() => <span className="text-body-regular text-text-tertiary">Tidak ada produk yang cocok.</span>}>
          {filtered.map((produk) => (
              <TableRow key={produk.code} id={produk.code}>
                <TableCell>
                  <Checkbox slot="selection" size="sm" aria-label={produk.name} />
                </TableCell>
                <TableCell>
                  <ProductPhoto category={produk.category} />
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-primary">{produk.name}</span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-secondary">{produk.code}</span>
                </TableCell>
                <TableCell>
                  <Chip variant="bold" color={CATEGORY_CHIP[produk.category]}>
                    {produk.category}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-primary tabular-nums">{produk.price}</span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap text-text-secondary tabular-nums">{produk.cost}</span>
                </TableCell>
                <TableCell>
                  <Switch
                    size="sm"
                    isSelected={active[produk.code]}
                    onChange={(on) =>
                      setActive((map) => ({ ...map, [produk.code]: on }))
                    }
                    aria-label={`Aktifkan ${produk.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2.5">
                    <IconButton
                      icon={RiEyeLine}
                      size="small"
                      aria-label={`Lihat ${produk.name}`}
                    />
                    <IconButton
                      icon={RiEdit2Line}
                      size="small"
                      aria-label={`Edit ${produk.name}`}
                    />
                    <IconButton
                      icon={RiDeleteBin6Line}
                      size="small"
                      aria-label={`Hapus ${produk.name}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="mt-3 px-3">
        <Pagination page={page} totalPages={3} onChange={setPage} />
      </div>
    </section>
  );
}
