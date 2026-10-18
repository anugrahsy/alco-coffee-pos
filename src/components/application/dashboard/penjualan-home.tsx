"use client";

import { useMemo, useRef, useState } from "react";
import { parseDate } from "@internationalized/date";
import {
	RiArrowDownSLine,
	RiCoinsFill,
	RiDownload2Line,
	RiFileCodeLine,
	RiFileExcel2Line,
	RiRefund2Line,
	RiReceiptLine,
	RiShoppingBag3Line,
} from "@remixicon/react";
import { Button, buttonStyles } from "@/components/base/buttons/button";
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
import {
	monitorComparison,
	monitorDelta,
} from "@/features/monitor/monitor-comparison";
import {
	compactRupiah,
	type MonitorPeriod,
} from "@/features/monitor/monitor-demo";
import {
	filterSalesOrders,
	parseSalesSearch,
	salesBusinessDate,
	salesDate,
	salesRange,
	salesMoney,
	salesNumber,
	salesTime,
	summarizeSales,
	type SalesSearch,
} from "@/features/sales/sales-demo";
import {
	downloadSalesFile,
	exportSummaryRows,
	productExportRows,
	salesCsv,
	salesXlsx,
	transactionExportRows,
} from "@/features/sales/sales-export";
import { useSalesDemo } from "@/features/sales/use-sales-demo";
import { PageHeader } from "./page-header";
import { StatCards, type Stat } from "./stat-cards";
import { TopProductsCard } from "./top-products-card";
import { TransactionsTable } from "./transactions-table";
import { printSalesReceipt, SalesOrderModal } from "./sales-order-modal";

const PERIODS = {
	day: "Hari ini",
	week: "Minggu ini",
	month: "Bulan ini",
	year: "Tahun ini",
} as const;

export function PenjualanHome({
	search,
	onSearch,
	showProductRecap = true,
}: {
	search: SalesSearch;
	onSearch: (patch: Partial<SalesSearch>, replace?: boolean) => void;
	showProductRecap?: boolean;
}) {
	const demo = useSalesDemo();
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [exporting, setExporting] = useState(false);
	const exportBusy = useRef(false);
	const date = useMemo(
		() => parseDate(salesBusinessDate(demo.now)),
		[demo.now],
	);
	const range = useMemo(
		() => salesRange(search, date),
		[search.period, search.from, search.to, date],
	);
	const rows = useMemo(
		() => filterSalesOrders(demo.orders, search, range),
		[demo.orders, search, range],
	);
	const summary = useMemo(() => summarizeSales(rows, range), [rows, range]);
	const comparison = useMemo(
		() => monitorComparison(search.period, range),
		[search.period, range],
	);
	const previous = useMemo(
		() =>
			summarizeSales(
				filterSalesOrders(demo.orders, search, comparison.range),
				comparison.range,
			),
		[demo.orders, search, comparison],
	);
	const pending = useMemo(
		() => demo.orders.filter((order) => order.status === "unpaid"),
		[demo.orders],
	);
	const selected = demo.orders.find((order) => order.id === search.order);
	const label =
		search.period === "custom" ? "Rentang dipilih" : PERIODS[search.period];
	const update = (patch: Partial<SalesSearch>, replace = false) => {
		onSearch(patch, replace);
		setError("");
		setMessage("");
	};
	const reset = () =>
		update({
			...parseSalesSearch({}),
			period: search.period,
			from: search.from,
			to: search.to,
		});
	const change = (current: number, before: number) =>
		range.start.compare(date) > 0
			? { delta: "—", deltaColor: "neutral" as const }
			: monitorDelta(current, before);
	const refundChange = change(summary.refunds, previous.refunds);
	const money = (value: number) =>
		Math.abs(value) >= 100000000 ? compactRupiah(value) : salesMoney(value);
	const caption = comparison.caption.replace(/^vs /, "");
	const comparisonRangeText = `${salesDate(comparison.range.start.toString())} – ${salesDate(comparison.range.end.toString())} WIB`;
	const comparisonHint = `Pembanding ${caption}: ${comparisonRangeText}. Periode ini masih berjalan; pembanding memakai periode kalender penuh. Pembanding nol ditampilkan —.`;
	const stats: Stat[] = [
		{
			icon: RiCoinsFill,
			label: "Pendapatan penjualan",
			value: money(summary.netSales),
			...change(summary.netSales, previous.netSales),
			hint: `Pendapatan setelah diskon/refund. ${comparisonHint}`,
		},
		{
			icon: RiReceiptLine,
			label: "Order dibayar",
			value: salesNumber(summary.paidOrders),
			...change(summary.paidOrders, previous.paidOrders),
			hint: `Pembanding ${caption}. Pembanding nol ditampilkan —.`,
		},
		{
			icon: RiShoppingBag3Line,
			label: "Item terjual (bersih)",
			value: salesNumber(summary.netUnits),
			...change(summary.netUnits, previous.netUnits),
			hint: `Dibayar ${salesNumber(summary.paidUnits)} unit · refund ${salesNumber(summary.refundUnits)} unit (${summary.refundCount} order).`,
		},
		{
			icon: RiRefund2Line,
			label: "Refund periode",
			value: money(summary.refunds),
			...refundChange,
			deltaColor:
				refundChange.deltaColor === "lime"
					? "rose"
					: refundChange.deltaColor === "rose"
						? "lime"
						: "neutral",
			hint: "Refund mengikuti tanggal pengembalian, bukan tanggal bayar asal.",
		},
	];
	const download = async (format: "xlsx" | "csv" | "products") => {
		if (exportBusy.current) return;
		if (demo.state !== "ready") {
			setError("Tunggu sampai data contoh tersedia.");
			return;
		}
		if (rows.length > 50000) {
			setError(
				"Maksimal 50.000 transaksi per ekspor. Perkecil rentang tanggal.",
			);
			return;
		}
		exportBusy.current = true;
		setExporting(true);
		setError("");
		setMessage("");
		try {
			const base = `contoh-${format === "products" ? "rekap-produk" : "penjualan"}-${range.start}-${range.end}-WIB`;
			if (format === "xlsx") {
				const buffer = await salesXlsx([
					{
						name: "Ringkasan",
						rows: exportSummaryRows(search, range, summary, rows.length),
					},
					{ name: "Transaksi", rows: transactionExportRows(rows, range) },
					{ name: "Rekap Produk", rows: productExportRows(summary.products) },
				]);
				downloadSalesFile(
					buffer as BlobPart,
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					`${base}.xlsx`,
				);
			} else
				downloadSalesFile(
					salesCsv(
						format === "products"
							? productExportRows(summary.products)
							: transactionExportRows(rows, range),
					),
					"text/csv;charset=utf-8",
					`${base}.csv`,
				);
			setMessage(
				`File Contoh Data disiapkan dari seluruh ${salesNumber(rows.length)} hasil terfilter, bukan hanya halaman tabel. Bukan laporan transaksi toko.`,
			);
		} catch {
			setError(
				"File tidak dapat dibuat. Coba unduh lagi; tidak ada data yang diubah.",
			);
		} finally {
			exportBusy.current = false;
			setExporting(false);
		}
	};
	return (
		<div className="flex w-full min-w-0 flex-col gap-4">
			<header className="flex flex-col gap-2">
				<PageHeader current="Penjualan" icon={RiShoppingBag3Line} />
				<div className="flex flex-wrap items-end justify-between gap-3 px-1">
					<div className="flex flex-col gap-0.5">
						<h1 className="text-title-2-medium text-text-primary">Penjualan</h1>
						<span className="text-body-medium text-text-secondary">
							Ringkasan penjualan toko · {label.toLocaleLowerCase("id-ID")}
						</span>
					</div>
				</div>
				<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
					<SegmentedControl
						selectedKeys={search.period === "custom" ? [] : [search.period]}
						aria-label="Periode Penjualan"
						onSelectionChange={(keys) => {
							const key = [...keys][0] as MonitorPeriod | undefined;
							if (key) update({ period: key, from: "", to: "" });
						}}
					>
						{Object.entries(PERIODS).map(([key, text]) => (
							<SegmentedControlItem key={key} id={key} className="py-1.5">
								{text}
							</SegmentedControlItem>
						))}
					</SegmentedControl>
					<div className="flex max-w-full flex-wrap items-center gap-2">
						<DateRangePicker
							aria-label="Rentang tanggal Penjualan"
							placeholder="Pilih tanggal"
							value={search.period === "custom" ? range : null}
							onChange={(value) => {
								if (!value) return;
								if (
									value.end.compare(value.start) > 365 ||
									value.start.year < 1900 ||
									value.end.year > 2100
								) {
									setError(
										"Preview mendukung 1900–2100 dengan rentang maksimal 366 hari. Perkecil rentang tanggal.",
									);
									return;
								}
								update({
									period: "custom",
									from: value.start.toString(),
									to: value.end.toString(),
								});
							}}
						/>
						<DownloadMenu
							disabled={
								demo.state !== "ready" || exporting || rows.length === 0
							}
							busy={exporting}
							onDownload={download}
						/>
					</div>
				</div>
			</header>
			{!demo.online && (
				<p
					role="status"
					className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary"
				>
					Offline · Data contoh lokal tetap dapat dilihat/diunduh; refund contoh
					dinonaktifkan.
				</p>
			)}
			{(error || demo.error) && (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-2 rounded-xl border border-border-error-default p-3 text-body-2-regular text-text-error-primary"
				>
					<span>{error || demo.error}</span>
					{demo.state === "error" && (
						<Button variant="secondary" size="small" onClick={demo.refresh}>
							Coba lagi
						</Button>
					)}
				</div>
			)}
			{message && (
				<p
					role="status"
					className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary"
				>
					{message}
				</p>
			)}
			{demo.state === "loading" && (
				<p role="status" className="p-4 text-body-regular text-text-secondary">
					Menyiapkan data contoh…
				</p>
			)}
			{demo.state === "ready" && (
				<>
					<StatCards variant="plain" stats={stats} />
					{showProductRecap && (
						<TopProductsCard products={summary.products} periodLabel={label} />
					)}
					<div className="flex flex-wrap items-center justify-between gap-2 px-1">
						<span className="text-body-2-regular text-text-secondary">
							Tagihan belum dibayar · Saat ini — semua tanggal: {pending.length}{" "}
							order ·{" "}
							{salesMoney(pending.reduce((sum, order) => sum + order.total, 0))}
						</span>
					</div>
					<TransactionsTable
						rows={rows}
						search={search}
						onSearch={(patch) => update(patch, "q" in patch || "page" in patch)}
						onDetail={(id) => update({ order: id, page: search.page })}
						onPrint={(order) => {
							if (!printSalesReceipt(order))
								setError("Popup cetak diblokir. Izinkan popup lalu coba lagi.");
						}}
						onReset={reset}
					/>
					<span className="px-1 text-caption-1-medium text-text-tertiary">
						Contoh diperbarui {salesTime(demo.now.toISOString())} WIB · Fixture
						Penjualan terpisah dari fixture Monitor/POS; bukan laporan toko atau
						sinkronisasi server.
					</span>
					{search.order && !selected && (
						<p role="status" className="text-body-regular text-text-secondary">
							Pesanan contoh tidak tersedia.{" "}
							<Button
								variant="ghost"
								size="small"
								onClick={() => update({ order: "", page: search.page }, true)}
							>
								Tutup detail
							</Button>
						</p>
					)}
					{selected && (
						<SalesOrderModal
							key={selected.id}
							order={selected}
							online={demo.online}
							onClose={() => update({ order: "", page: search.page })}
							onRefund={(reason, confirmed) => {
								demo.refund(selected.id, reason, confirmed);
								setMessage(
									"Refund contoh tersimpan lokal. Tidak ada dana atau transaksi server yang diproses.",
								);
							}}
						/>
					)}
				</>
			)}
		</div>
	);
}

function DownloadMenu({
	disabled,
	busy,
	onDownload,
}: {
	disabled: boolean;
	busy: boolean;
	onDownload: (format: "xlsx" | "csv" | "products") => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Dropdown isOpen={open} onOpenChange={setOpen}>
			<DropdownTrigger
				isDisabled={disabled}
				aria-label="Download Penjualan"
				className={cx(
					buttonStyles.base,
					buttonStyles.size.medium,
					buttonStyles.variant.primary,
				)}
			>
				<RiDownload2Line className={buttonStyles.icon.medium} aria-hidden />
				<span className={buttonStyles.label.medium}>
					{busy ? "Menyiapkan…" : "Download"}
				</span>
				<RiArrowDownSLine className={buttonStyles.icon.medium} aria-hidden />
			</DropdownTrigger>
			<DropdownPopover
				aria-label="Download Penjualan"
				placement="bottom end"
				className="w-64"
			>
				<p className="px-2 py-1 text-caption-1-medium text-text-tertiary">
					Seluruh hasil terfilter · Contoh Data
				</p>
				<DropdownItem
					onSelect={() => {
						setOpen(false);
						onDownload("xlsx");
					}}
				>
					<RiFileExcel2Line
						className="size-4 shrink-0 text-foreground-icon-secondary"
						aria-hidden
					/>
					<span>Excel (.xlsx)</span>
				</DropdownItem>
				<DropdownItem
					onSelect={() => {
						setOpen(false);
						onDownload("csv");
					}}
				>
					<RiFileCodeLine
						className="size-4 shrink-0 text-foreground-icon-secondary"
						aria-hidden
					/>
					<span>Transaksi (.csv)</span>
				</DropdownItem>
				<DropdownItem
					onSelect={() => {
						setOpen(false);
						onDownload("products");
					}}
				>
					<RiFileCodeLine
						className="size-4 shrink-0 text-foreground-icon-secondary"
						aria-hidden
					/>
					<span>Rekap produk (.csv)</span>
				</DropdownItem>
			</DropdownPopover>
		</Dropdown>
	);
}
