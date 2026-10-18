"use client";

import { useEffect, useRef, useState } from "react";
import {
	RiEyeLine,
	RiMore2Fill,
	RiPrinterLine,
	RiReceiptLine,
	RiRefreshLine,
	RiSearchLine,
	RiShoppingBagLine,
	RiStore2Line,
} from "@remixicon/react";
import { Fullscreen } from "lucide-react";
import { Chip } from "@/components/base/badges/chip";
import { StatusDot } from "@/components/base/badges/status-dot";
import { Button } from "@/components/base/buttons/button";
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
import {
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@/components/base/table/table";
import { cx } from "@/utils/cx";
import {
	orderUnits,
	PAYMENT_LABELS,
	STATUS_LABELS,
	SALES_PRODUCTS,
	SALES_CASHIERS,
	SALES_PAGE_SIZE,
	salesDate,
	salesTime,
	salesMoney,
	salesNumber,
	salesPage,
	type SalesOrder,
	type SalesSearch,
	type SalesMethod,
} from "@/features/sales/sales-demo";

const PAYMENT_CHIP: Record<SalesMethod, "lime" | "blue" | "yellow"> = {
	cash: "lime",
	qris_manual: "blue",
	bank_transfer_manual: "yellow",
};

/** Ringkasan item pesanan: "Espresso × 2, Nasi Bowl × 3". */
const itemSummary = (order: SalesOrder) =>
	order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ");

/** Potong ke maks karakter (elipsis ikut dihitung): "Espresso × 2, Na…". */
const clipText = (value: string, max = 17) =>
	value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
function MoreMenu({
	order,
	onDetail,
	onPrint,
}: {
	order: SalesOrder;
	onDetail: () => void;
	onPrint: () => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Dropdown isOpen={open} onOpenChange={setOpen}>
			<DropdownTrigger
				aria-label={`Aksi ${order.number}`}
				className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-2lg border border-border-button-default bg-background-primary-default text-foreground-icon-primary shadow-xs outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring max-sm:min-h-11 max-sm:min-w-11"
			>
				<RiMore2Fill className="size-4" aria-hidden />
			</DropdownTrigger>
			<DropdownPopover
				aria-label={`Aksi ${order.number}`}
				placement="bottom end"
				className="w-36"
			>
				<DropdownItem
					onSelect={() => {
						setOpen(false);
						onDetail();
					}}
				>
					<RiReceiptLine
						className="size-4 shrink-0 text-foreground-icon-secondary"
						aria-hidden
					/>
					<span>Lihat Detail</span>
				</DropdownItem>
				{order.status !== "cancelled" && (
					<DropdownItem
						onSelect={() => {
							setOpen(false);
							onPrint();
						}}
					>
						<RiPrinterLine
							className="size-4 shrink-0 text-foreground-icon-secondary"
							aria-hidden
						/>
						<span>Struk</span>
					</DropdownItem>
				)}
			</DropdownPopover>
		</Dropdown>
	);
}

export function TransactionsTable({
	rows,
	search,
	onSearch,
	onDetail,
	onPrint,
	onReset,
}: {
	rows: SalesOrder[];
	search: SalesSearch;
	onSearch: (patch: Partial<SalesSearch>) => void;
	onDetail: (id: string) => void;
	onPrint: (order: SalesOrder) => void;
	onReset: () => void;
}) {
	const paged = salesPage(rows, search.page);
	const tableRef = useRef<HTMLTableElement>(null);
	useEffect(() => {
		tableRef.current?.parentElement?.scrollTo({ left: 0 });
	}, [
		search.q,
		search.method,
		search.type,
		search.status,
		search.cashier,
		search.product,
		search.period,
		search.from,
		search.to,
	]);
	const filterClass = "min-w-0 max-w-44 shrink-0";
	return (
		<section
			aria-label="Daftar transaksi"
			className="flex w-full min-w-0 flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2"
		>
			<div className="flex min-h-14 flex-col gap-3 px-3 py-1 xl:flex-row xl:items-center xl:justify-between">
				<div className="flex shrink-0 flex-col justify-center">
					<span className="text-body-medium text-text-tertiary">
						Total Transaksi
					</span>
					<span
						aria-live="polite"
						className="text-body-medium text-text-primary"
					>
						{salesNumber(rows.length)} transaksi
					</span>
				</div>
				<div className="flex w-full min-w-0 flex-wrap items-center gap-2 xl:flex-1 xl:justify-end">
					<Select
						aria-label="Filter pembayaran"
						className={filterClass}
						selectedKey={search.method}
						onSelectionChange={(key) => onSearch({ method: String(key) })}
						renderValue="Metode"
					>
						<SelectItem id="all">Semua</SelectItem>
						{Object.entries(PAYMENT_LABELS).map(([id, label]) => (
							<SelectItem key={id} id={id}>
								{label}
							</SelectItem>
						))}
					</Select>
					<Select
						aria-label="Filter pesanan"
						className={filterClass}
						selectedKey={search.type}
						onSelectionChange={(key) => onSearch({ type: String(key) })}
						renderValue="Jenis"
					>
						<SelectItem id="all">Semua</SelectItem>
						<SelectItem id="Dine In">Dine In</SelectItem>
						<SelectItem id="Take Away">Take Away</SelectItem>
					</Select>
					<Select
						aria-label="Filter status"
						className={filterClass}
						selectedKey={search.status}
						onSelectionChange={(key) =>
							onSearch({
								status: String(key),
								method: String(key) === "unpaid" ? "all" : search.method,
							})
						}
						renderValue="Status"
					>
						<SelectItem id="sales">Lunas + Refund</SelectItem>
						<SelectItem id="all">Semua</SelectItem>
						{Object.entries(STATUS_LABELS).map(([id, label]) => (
							<SelectItem key={id} id={id}>
								{label}
							</SelectItem>
						))}
					</Select>
					<Select
						aria-label="Filter kasir"
						className={filterClass}
						selectedKey={search.cashier}
						onSelectionChange={(key) => onSearch({ cashier: String(key) })}
						renderValue="Kasir"
					>
						<SelectItem id="all">Semua</SelectItem>
						{SALES_CASHIERS.map((name) => (
							<SelectItem key={name} id={name}>
								{name}
							</SelectItem>
						))}
					</Select>
					<Select
						aria-label="Pesanan berisi produk"
						className={filterClass}
						selectedKey={search.product}
						onSelectionChange={(key) => onSearch({ product: String(key) })}
						renderValue="Produk"
					>
						<SelectItem id="all">Semua</SelectItem>
						{SALES_PRODUCTS.map((p) => (
							<SelectItem key={p.id} id={p.id}>
								{p.name}
							</SelectItem>
						))}
					</Select>
					<div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
						<Button
							variant="secondary"
							size="medium"
							leadingIcon={RiRefreshLine}
							onClick={onReset}
							className="max-sm:min-h-11"
						>
							Reset
						</Button>
						<Input
							placeholder="Cari transaksi…"
							aria-label="Cari transaksi"
							leadingIcon={RiSearchLine}
							value={search.q}
							onChange={(q) => onSearch({ q })}
							maxLength={120}
							className="min-w-0 flex-1 sm:w-56 sm:flex-none"
							fieldClassName="rounded-full bg-background-secondary-default"
							inputClassName="text-body-medium"
						/>
					</div>
				</div>
			</div>
			{(search.status === "unpaid" || search.status === "all") && (
				<p className="px-3 pb-2 text-body-2-regular text-text-tertiary">
					Belum Dibayar: saat ini — semua tanggal; tanggal yang ditampilkan
					adalah tanggal dibuat. Unpaid/cancelled tidak menambah penjualan.
				</p>
			)}
			{search.product !== "all" && (
				<p className="px-3 pb-2 text-body-2-regular text-text-tertiary">
					Filter produk menampilkan pesanan yang memuat produk tersebut; nominal
					dan rekap tetap mencakup seluruh item pesanan.
				</p>
			)}
			<Table
				ref={tableRef}
				aria-label="Transaksi Penjualan"
				className="min-w-[1320px]"
				selectionMode="none"
			>
				<TableHeader>
					<TableColumn id="number" isRowHeader className="w-56">
						ID Transaksi
					</TableColumn>
					<TableColumn id="date" className="w-36">
						Waktu bayar · WIB
					</TableColumn>
					<TableColumn id="cashier" className="w-24">
						Kasir
					</TableColumn>
					<TableColumn id="items" className="w-48">
						Jumlah Item
					</TableColumn>
					<TableColumn id="total" className="w-36">
						Total asli
					</TableColumn>
					<TableColumn id="method" className="w-40">
						Pembayaran
					</TableColumn>
					<TableColumn id="type" className="w-36">
						Jenis Pesanan
					</TableColumn>
					<TableColumn id="status" className="w-36">
						Status
					</TableColumn>
					<TableColumn id="actions" className="w-24">
						Aksi
					</TableColumn>
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<div className="flex flex-col items-start gap-2 p-4">
							<p className="text-body-medium text-text-secondary">
								Tidak ada transaksi yang sesuai filter.
							</p>
							<Button
								variant="secondary"
								size="medium"
								leadingIcon={RiRefreshLine}
								onClick={onReset}
								className="max-sm:min-h-11"
							>
								Reset
							</Button>
						</div>
					)}
				>
					{paged.rows.map((order) => {
						const units = orderUnits(order);
						const Icon =
							order.orderType === "Dine In" ? RiStore2Line : RiShoppingBagLine;
						return (
							<TableRow key={order.id} id={order.id}>
								<TableCell>
									<div className="flex flex-col gap-1">
										<span className="whitespace-nowrap">{order.number}</span>
										<span className="text-body-2-regular text-text-tertiary">
											{order.label}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col gap-1">
										<span className="whitespace-nowrap">
											{salesDate(order.paidAt ?? order.createdAt)}
										</span>
										<span className="text-body-2-regular text-text-tertiary">
											{salesTime(order.paidAt ?? order.createdAt)} WIB
											{!order.paidAt && " · dibuat"}
										</span>
										{order.refund && (
											<span className="text-caption-1-medium text-text-tertiary">
												Refund {salesDate(order.refund.at)}
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>{order.cashier}</TableCell>
								<TableCell>
									<Button
										variant="secondary"
										size="small"
										trailingIcon={Fullscreen}
										aria-label={`Lihat item ${order.number}`}
										className="w-28 justify-between max-sm:min-h-11"
										onClick={() => onDetail(order.id)}
									>
										<span className="flex items-center gap-1.5">
											<StatusDot
												color={
													units <= 1
														? "indigo"
														: units <= 3
															? "green"
															: "yellow"
												}
											/>
											{units} Item
										</span>
									</Button>
									<p
										title={itemSummary(order)}
										className="mt-1 max-w-44 truncate text-caption-1-medium text-text-tertiary"
									>
										{clipText(itemSummary(order))}
									</p>
								</TableCell>
								<TableCell>
									<span
										className={cx(
											"inline-flex whitespace-nowrap rounded-md px-1.5 py-1 text-body-medium tabular-nums",
											order.total > 100000
												? "bg-status-lime-background text-status-lime-text"
												: "bg-background-secondary-default text-text-primary",
										)}
									>
										{salesMoney(order.total)}
									</span>
								</TableCell>
								<TableCell>
									{order.method ? (
										<Chip variant="bold" color={PAYMENT_CHIP[order.method]}>
											{PAYMENT_LABELS[order.method]}
										</Chip>
									) : (
										<span className="text-text-tertiary">—</span>
									)}
								</TableCell>
								<TableCell>
									<span className="inline-flex items-center gap-2 whitespace-nowrap">
										<Icon
											className={cx(
												"size-4 shrink-0",
												order.orderType === "Dine In"
													? "text-status-lime-text"
													: "text-status-orange-text",
											)}
											aria-hidden
										/>
										{order.orderType}
									</span>
								</TableCell>
								<TableCell>
									<Chip
										variant="bold"
										color={
											order.status === "paid"
												? "lime"
												: order.status === "refunded"
													? "rose"
													: order.status === "unpaid"
														? "yellow"
														: "neutral"
										}
									>
										{STATUS_LABELS[order.status]}
									</Chip>
								</TableCell>
								<TableCell>
									<div className="flex items-center justify-end gap-2">
										<IconButton
											icon={RiEyeLine}
											size="small"
											className="max-sm:min-h-11 max-sm:min-w-11"
											aria-label={`Lihat detail ${order.number}`}
											onClick={() => onDetail(order.id)}
										/>
										<MoreMenu
											order={order}
											onDetail={() => onDetail(order.id)}
											onPrint={() => onPrint(order)}
										/>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<div className="mt-3 flex flex-col gap-3 px-3">
				<p className="text-body-2-regular text-text-tertiary">
					{rows.length
						? `Menampilkan ${(paged.page - 1) * SALES_PAGE_SIZE + 1}–${Math.min(paged.page * SALES_PAGE_SIZE, rows.length)} dari ${salesNumber(rows.length)} transaksi`
						: "0 transaksi"}
				</p>
				<Pagination
					page={paged.page}
					totalPages={paged.pages}
					onChange={(page) => onSearch({ page })}
					previousLabel="Sebelumnya"
					nextLabel="Berikutnya"
					aria-label="Halaman transaksi"
				/>
			</div>
		</section>
	);
}
