"use client";

import { useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  RiCakeLine,
  RiCupLine,
  RiEyeLine,
  RiFileList3Line,
  RiMore2Fill,
  RiPrinterLine,
  RiReceiptLine,
  RiSearchLine,
  RiShoppingBagLine,
  RiStore2Line,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { StatusDot } from "@/components/base/badges/status-dot";
import { CloseButton } from "@/components/base/buttons/close-button";
import { IconButton } from "@/components/base/buttons/icon-button";
import {
  Dropdown,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/base/dropdown/dropdown";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";

/* ---------------------------------------------------------------------------
 * Tabel transaksi penjualan. Kolom: ID Transaksi, Tanggal, Total (rupiah),
 * Pembayaran, Waktu, Jumlah Item (klik → modal detail pesanan), Jenis Pesanan.
 * Pembayaran diwarnai: Tunai hijau, QRIS biru, Transfer kuning.
 * ------------------------------------------------------------------------- */

type PaymentMethod = "Tunai" | "QRIS" | "Transfer";
type OrderType = "Dine In" | "Take Away";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

interface OrderItem {
  name: string;
  qty: number;
  subtotal: string;
  icon: IconComponent;
}

interface TransactionRow {
  id: string;
  date: string;
  time: string;
  total: string;
  method: PaymentMethod;
  orderType: OrderType;
  items: OrderItem[];
  /** Total di atas Rp 100.000 — ditandai warna status. */
  highValue?: boolean;
}

const PAYMENT_CHIP: Record<PaymentMethod, "lime" | "blue" | "yellow"> = {
  Tunai: "lime",
  QRIS: "blue",
  Transfer: "yellow",
};

const ORDER_TYPE_ICON: Record<OrderType, IconComponent> = {
  "Dine In": RiStore2Line,
  "Take Away": RiShoppingBagLine,
};

const ORDER_TYPE_COLOR: Record<OrderType, string> = {
  "Dine In": "text-status-lime-text",
  "Take Away": "text-status-orange-text",
};

const TRANSACTION_ROWS: TransactionRow[] = [
  {
    id: "#COF123",
    date: "Sep 05, 2026",
    time: "09:30",
    total: "Rp 135.000",
    highValue: true,
    method: "Tunai",
    orderType: "Dine In",
    items: [
      { name: "Espresso", qty: 2, subtotal: "Rp 60.000", icon: RiCupLine },
      { name: "Croissant", qty: 1, subtotal: "Rp 75.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF124",
    date: "Sep 05, 2026",
    time: "10:15",
    total: "Rp 92.000",
    method: "QRIS",
    orderType: "Take Away",
    items: [
      { name: "Caffe Latte", qty: 2, subtotal: "Rp 64.000", icon: RiCupLine },
      { name: "Pain au Chocolat", qty: 1, subtotal: "Rp 28.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF125",
    date: "Sep 05, 2026",
    time: "11:00",
    total: "Rp 58.000",
    method: "Transfer",
    orderType: "Dine In",
    items: [
      { name: "Espresso", qty: 1, subtotal: "Rp 30.000", icon: RiCupLine },
      { name: "Cookies", qty: 2, subtotal: "Rp 28.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF126",
    date: "Sep 05, 2026",
    time: "12:40",
    total: "Rp 210.000",
    highValue: true,
    method: "QRIS",
    orderType: "Dine In",
    items: [
      { name: "Nasi Bowl", qty: 3, subtotal: "Rp 150.000", icon: RiStore2Line },
      { name: "Ice Tea", qty: 3, subtotal: "Rp 60.000", icon: RiCupLine },
    ],
  },
  {
    id: "#COF127",
    date: "Sep 05, 2026",
    time: "14:05",
    total: "Rp 45.000",
    method: "Tunai",
    orderType: "Take Away",
    items: [
      { name: "Americano", qty: 1, subtotal: "Rp 20.000", icon: RiCupLine },
      { name: "Croissant", qty: 1, subtotal: "Rp 25.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF128",
    date: "Sep 05, 2026",
    time: "15:20",
    total: "Rp 128.000",
    highValue: true,
    method: "Transfer",
    orderType: "Take Away",
    items: [
      { name: "Caffe Latte", qty: 2, subtotal: "Rp 64.000", icon: RiCupLine },
      { name: "Cheese Cake", qty: 1, subtotal: "Rp 64.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF129",
    date: "Sep 05, 2026",
    time: "16:45",
    total: "Rp 74.000",
    method: "QRIS",
    orderType: "Dine In",
    items: [
      { name: "Hot Chocolate", qty: 1, subtotal: "Rp 32.000", icon: RiCupLine },
      { name: "Tiramisu", qty: 1, subtotal: "Rp 42.000", icon: RiCakeLine },
    ],
  },
  {
    id: "#COF130",
    date: "Sep 05, 2026",
    time: "17:30",
    total: "Rp 160.000",
    highValue: true,
    method: "Tunai",
    orderType: "Dine In",
    items: [
      { name: "Espresso", qty: 2, subtotal: "Rp 60.000", icon: RiCupLine },
      { name: "Nasi Bowl", qty: 2, subtotal: "Rp 100.000", icon: RiStore2Line },
    ],
  },
];

/** Label jenis pesanan dengan ikon berwarna (Dine In / Take Away). */
function OrderTypeLabel({ type }: { type: OrderType }) {
  const Icon = ORDER_TYPE_ICON[type];
  return (
    <span className="inline-flex items-center gap-2 text-body-medium text-text-primary">
      <Icon className={cx("size-4", ORDER_TYPE_COLOR[type])} aria-hidden />
      {type}
    </span>
  );
}

const ICON_BUTTON_TRIGGER =
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-2lg border border-border-button-default bg-background-primary-default text-foreground-icon-primary shadow-xs transition-[background-color,border-color,box-shadow,color] duration-150 ease outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring hover:bg-background-primary-hover hover:border-border-button-hover active:bg-background-primary-active active:border-border-button-active";

/** Menu "..." per baris: aksi lain (lihat struk, cetak ulang). */
function MoreMenu({ row }: { row: TransactionRow }) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      <DropdownTrigger className={ICON_BUTTON_TRIGGER}>
        <RiMore2Fill className="size-4" aria-hidden />
      </DropdownTrigger>
      <DropdownPopover
        aria-label={`Aksi ${row.id}`}
        placement="bottom end"
        className="w-[160px]"
      >
        <DropdownItem onSelect={() => setOpen(false)}>
          <RiReceiptLine className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
          <span className="text-body-medium">Lihat Struk</span>
        </DropdownItem>
        <DropdownItem onSelect={() => setOpen(false)}>
          <RiPrinterLine className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
          <span className="text-body-medium">Cetak Ulang</span>
        </DropdownItem>
      </DropdownPopover>
    </Dropdown>
  );
}

/** Warna titik jumlah item: 1 indigo (basic), 2 hijau, 3+ kuning. */
function itemCountDotColor(count: number): "green" | "yellow" | "indigo" {
  if (count <= 1) return "indigo";
  if (count === 2) return "green";
  return "yellow";
}

/** Total sebagai chip. Order di atas Rp 100.000 ditandai warna status-lime. */
function TotalChip({ value, highValue }: { value: string; highValue?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-md px-1.5 py-1 whitespace-nowrap text-body-medium",
        highValue
          ? "bg-status-lime-background text-status-lime-text"
          : "bg-background-secondary-default text-text-primary",
      )}
    >
      {value}
    </span>
  );
}

/** Modal daftar item pesanan. Terbuka saat klik "N Item" pada kolom Jumlah Item. */
function OrderItemsModal({
  order,
  onClose,
}: {
  order: TransactionRow | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Tutup detail pesanan"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-border-button-default bg-background-primary-default p-6 shadow-dropdown">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-title-3-semibold text-text-primary">Detail Pesanan</h2>
            <p className="mt-1 text-body-2-regular text-text-secondary">{order.id}</p>
          </div>
          <CloseButton size="md" aria-label="Tutup" onClick={onClose} />
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          {order.items.map((item) => (
            <li key={item.name} className="flex items-center gap-3 rounded-2lg px-2 py-2">
              <item.icon className="size-5 shrink-0 text-foreground-icon-secondary" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-body-medium text-text-primary">
                {item.name}
              </span>
              <span className="text-body-2-regular text-text-secondary">x{item.qty}</span>
              <span className="text-body-medium text-text-primary">{item.subtotal}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-separator-border pt-3">
          <span className="text-body-medium text-text-secondary">Total</span>
          <span className="text-body-medium text-text-primary">{order.total}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<TransactionRow | null>(null);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  const rows = TRANSACTION_ROWS.filter(
    (row) =>
      (paymentFilter === "all" || row.method === paymentFilter) &&
      (orderFilter === "all" || row.orderType === orderFilter),
  );

  return (
    <section className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
        <div className="flex h-10 flex-col justify-center">
          <span className="text-body-medium text-text-tertiary">Total Transaksi</span>
          <span className="text-body-medium text-text-primary">660 transaksi</span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
          <Select
            aria-label="Filter pembayaran"
            defaultSelectedKey="all"
            onSelectionChange={(key) => setPaymentFilter(String(key))}
          >
            <SelectItem id="all">Semua Pembayaran</SelectItem>
            <SelectItem id="Tunai">Tunai</SelectItem>
            <SelectItem id="QRIS">QRIS</SelectItem>
            <SelectItem id="Transfer">Transfer</SelectItem>
          </Select>
          <Select
            aria-label="Filter pesanan"
            defaultSelectedKey="all"
            onSelectionChange={(key) => setOrderFilter(String(key))}
          >
            <SelectItem id="all">Semua Pesanan</SelectItem>
            <SelectItem id="Dine In">Dine In</SelectItem>
            <SelectItem id="Take Away">Take Away</SelectItem>
          </Select>
          <Input
            placeholder="Search"
            aria-label="Search transaksi"
            leadingIcon={RiSearchLine}
            className="min-w-[153px] flex-1 sm:w-[153px] sm:min-w-0 sm:flex-none"
            fieldClassName="rounded-full bg-background-secondary-default"
            inputClassName="text-body-medium"
          />
        </div>
      </div>

      <Table aria-label="Transaksi" className="min-w-[1080px]">
        <TableHeader>
          <TableColumn id="id" isRowHeader className="w-[140px]">
            ID Transaksi
          </TableColumn>
          <TableColumn id="date" className="w-[140px]">
            Tanggal
          </TableColumn>
          <TableColumn id="time" className="w-[100px]">
            Waktu
          </TableColumn>
          <TableColumn id="items" className="w-[150px]">
            Jumlah Item
          </TableColumn>
          <TableColumn id="total" className="w-[140px]">
            Total
          </TableColumn>
          <TableColumn id="method" className="w-[130px]">
            Pembayaran
          </TableColumn>
          <TableColumn id="orderType" className="w-[150px]">
            Jenis Pesanan
          </TableColumn>
          <TableColumn id="actions" className="w-[120px]">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} id={row.id}>
              <TableCell>
                <span className="whitespace-nowrap">{row.id}</span>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap">{row.date}</span>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap">{row.time}</span>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  aria-label={`Lihat item ${row.id}`}
                  onClick={() => setSelectedOrder(row)}
                  className="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-2lg border border-border-button-default bg-background-primary-default px-2.5 py-2 text-body-medium text-text-primary shadow-xs transition-[background-color,border-color,box-shadow] duration-200 ease hover:bg-background-primary-hover hover:border-border-button-hover outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring disabled:cursor-not-allowed disabled:bg-background-primary-disabled disabled:text-text-tertiary disabled:shadow-none"
                >
                  <span className="flex min-w-0 items-center truncate">
                    <span className="flex items-center gap-1.25">
                      <StatusDot color={itemCountDotColor(row.items.length)} />
                      {row.items.length} Item
                    </span>
                  </span>
                  <RiFileList3Line className="size-4 shrink-0 text-text-secondary" aria-hidden />
                </button>
              </TableCell>
              <TableCell>
                <TotalChip value={row.total} highValue={row.highValue} />
              </TableCell>
              <TableCell>
                <Chip variant="bold" color={PAYMENT_CHIP[row.method]}>
                  {row.method}
                </Chip>
              </TableCell>
              <TableCell>
                <OrderTypeLabel type={row.orderType} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <IconButton
                    icon={RiEyeLine}
                    size="small"
                    aria-label={`Lihat detail ${row.id}`}
                    onClick={() => setSelectedOrder(row)}
                  />
                  <MoreMenu row={row} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-3 px-3">
        <Pagination page={page} totalPages={55} onChange={setPage} />
      </div>

      <OrderItemsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </section>
  );
}
