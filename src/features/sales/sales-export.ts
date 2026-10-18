import {
	inSalesRange,
	orderUnits,
	PAYMENT_LABELS,
	STATUS_LABELS,
	salesBusinessDate,
	salesTime,
	type SalesOrder,
	type SalesSearch,
	type ProductRecap,
} from "./sales-demo.ts";
import type { MonitorRange } from "../monitor/monitor-demo.ts";

type Cell = string | number;
export type ExportTable = Cell[][];
export function csvCell(value: Cell) {
	if (typeof value === "number") return String(value);
	const safe = /^(?:[\s\x00-\x1f]*[=+\-@]|[\t\r\n])/.test(value)
		? `'${value}`
		: value;
	return `"${safe.replaceAll('"', '""')}"`;
}
export const salesCsv = (rows: ExportTable) =>
	"\uFEFF" +
	rows.map((row) => row.map(csvCell).join(",")).join("\r\n") +
	"\r\n";
export function transactionExportRows(
	orders: SalesOrder[],
	range: MonitorRange,
): ExportTable {
	return [
		[
			"Nomor order",
			"Tanggal bayar WIB",
			"Waktu bayar WIB",
			"Tanggal dibuat WIB",
			"Pelanggan/meja",
			"Kasir",
			"Ringkasan item",
			"Jumlah unit",
			"Metode",
			"Status",
			"Subtotal IDR",
			"Diskon IDR",
			"Total pembayaran asli IDR",
			"Tanggal refund WIB",
			"Refund pada periode IDR",
			"Penjualan bersih periode IDR",
			"Sumber",
		],
		...orders.map((order) => {
			const refunded = inSalesRange(order.refund?.at, range)
				? order.refund!.amount
				: 0;
			return [
				order.number,
				order.paidAt ? salesBusinessDate(order.paidAt) : "",
				order.paidAt ? salesTime(order.paidAt) : "",
				salesBusinessDate(order.createdAt),
				order.label,
				order.cashier,
				order.items.map((i) => `${i.name} × ${i.quantity}`).join("; "),
				orderUnits(order),
				order.method ? PAYMENT_LABELS[order.method] : "—",
				STATUS_LABELS[order.status],
				order.subtotal,
				order.discount,
				order.paidAt ? order.total : 0,
				order.refund ? salesBusinessDate(order.refund.at) : "",
				refunded,
				(inSalesRange(order.paidAt, range) ? order.total : 0) - refunded,
				"Contoh Data · bukan laporan toko",
			];
		}),
	];
}
export function productExportRows(products: ProductRecap[]): ExportTable {
	return [
		[
			"ID produk",
			"Produk",
			"Unit dibayar",
			"Unit refund",
			"Unit bersih",
			"Penjualan bersih IDR",
			"Sumber",
		],
		...products.map((p) => [
			p.id,
			p.name,
			p.paidUnits,
			p.refundUnits,
			p.netUnits,
			p.revenue,
			"Contoh Data · bukan laporan toko",
		]),
	];
}
export async function salesXlsx(tables: { name: string; rows: ExportTable }[]) {
	// Load only when requested: this large dependency must not delay sales navigation.
	const { default: ExcelJS } = await import("exceljs");
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "Alco Coffee POS — Contoh Data";
	for (const table of tables) {
		const sheet = workbook.addWorksheet(table.name);
		for (const row of table.rows) sheet.addRow(row);
		sheet.views = [{ state: "frozen", ySplit: 1 }];
		sheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: table.rows[0]?.length ?? 1 },
		};
		sheet.getRow(1).font = { bold: true };
		sheet.columns.forEach((column, index) => {
			column.width = index === 0 ? 30 : 25;
			if (String(table.rows[0]?.[index]).includes("IDR"))
				column.numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0';
		});
		// ExcelJS receives plain string values, never formula/hyperlink objects.
	}
	return new Uint8Array(await workbook.xlsx.writeBuffer());
}
export function exportSummaryRows(
	search: SalesSearch,
	range: MonitorRange,
	summary: {
		netSales: number;
		paidOrders: number;
		netUnits: number;
		refunds: number;
	},
	count: number,
): ExportTable {
	return [
		["Keterangan", "Nilai"],
		["Sumber", "CONTOH DATA — BUKAN LAPORAN TOKO"],
		["Zona waktu", "Asia/Jakarta (WIB)"],
		["Mulai inklusif", range.start.toString()],
		["Selesai inklusif", range.end.toString()],
		["Metode", search.method],
		["Status", search.status],
		["Kasir", search.cashier],
		["Pesanan berisi produk", search.product],
		["Jenis pesanan", search.type],
		["Pencarian", search.q],
		["Seluruh hasil (bukan halaman tabel)", count],
		["Pendapatan penjualan IDR", summary.netSales],
		["Order dibayar", summary.paidOrders],
		["Unit bersih", summary.netUnits],
		["Refund IDR", summary.refunds],
		[
			"Aturan",
			"Pembayaran pada tanggal bayar; refund pada tanggal pengembalian. Unpaid/cancelled tidak masuk penjualan. Filter produk mencocokkan pesanan, bukan memotong subtotal item.",
		],
	];
}
export function downloadSalesFile(
	data: BlobPart,
	mime: string,
	filename: string,
) {
	const url = URL.createObjectURL(new Blob([data], { type: mime }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
