import test from "node:test";
import assert from "node:assert/strict";
import { parseDate } from "@internationalized/date";
import {
	createSalesRefund,
	filterSalesOrders,
	inSalesRange,
	itemTotal,
	makeSalesDemoOrders,
	orderUnits,
	overlaySalesRefunds,
	parseSalesRefunds,
	parseSalesSearch,
	salesBusinessDate,
	salesPage,
	salesRange,
	summarizeSales,
	type SalesOrder,
} from "./sales-demo.ts";
import {
	csvCell,
	exportSummaryRows,
	productExportRows,
	salesCsv,
	salesXlsx,
	transactionExportRows,
} from "./sales-export.ts";

const now = new Date("2026-10-17T21:00:00+07:00");
const date = parseDate("2026-10-17");
const orders = makeSalesDemoOrders(now);
test("dashboard defaults to calendar month; date ranges use WIB and validate URL input", () => {
	assert.equal(parseSalesSearch({}).period, "month");
	assert.equal(salesBusinessDate("2026-10-16T17:00:00Z"), "2026-10-17");
	assert.equal(salesBusinessDate("2026-10-16T16:59:59Z"), "2026-10-16");
	const week = salesRange(parseSalesSearch({ period: "week" }), date);
	assert.equal(week.start.toString(), "2026-10-12");
	assert.equal(week.end.toString(), "2026-10-18");
	for (const input of [
		{ period: "custom", from: "bad", to: "bad" },
		{ period: "custom", from: "2026-02-02", to: "2026-01-01" },
		{ period: "custom", from: "2024-01-01", to: "2026-01-01" },
	])
		assert.equal(parseSalesSearch(input).period, "month");
	assert.equal(parseSalesSearch({ method: "bogus", page: -1 }).page, 1);
});
test("summary, products and full transaction export reconcile for every preset", () => {
	for (const period of ["day", "week", "month", "year"]) {
		const query = parseSalesSearch({ period }),
			range = salesRange(query, date);
		const rows = filterSalesOrders(orders, query, range),
			summary = summarizeSales(rows, range);
		assert.equal(
			summary.products.reduce((s, p) => s + p.netUnits, 0),
			summary.netUnits,
		);
		assert.equal(
			summary.products.reduce((s, p) => s + p.revenue, 0),
			summary.netSales,
		);
		assert.equal(summary.receipts - summary.refunds, summary.netSales);
		const exported = transactionExportRows(rows, range);
		assert.equal(exported.length, rows.length + 1);
		assert.equal(
			exported.slice(1).reduce((s, r) => s + Number(r[15]), 0),
			summary.netSales,
		);
		assert.equal(
			productExportRows(summary.products)
				.slice(1)
				.reduce((s, r) => s + Number(r[5]), 0),
			summary.netSales,
		);
	}
});
test("paid day, not created day; cross-period refunds leave original sale intact and can be negative", () => {
	const order = orders.find(
		(o) => o.refund && salesBusinessDate(o.paidAt!) === "2026-09-28",
	)!;
	const original = {
		start: parseDate("2026-09-28"),
		end: parseDate("2026-09-28"),
	};
	const refundDay = {
		start: parseDate("2026-09-30"),
		end: parseDate("2026-09-30"),
	};
	assert.equal(summarizeSales([order], original).netSales, order.total);
	assert.equal(summarizeSales([order], refundDay).netSales, -order.total);
	assert.equal(summarizeSales([order], refundDay).netUnits, -orderUnits(order));
	const saved = orders.find(
		(o) =>
			o.paidAt &&
			salesBusinessDate(o.createdAt) !== salesBusinessDate(o.paidAt),
	)!;
	assert.ok(
		!inSalesRange(saved.createdAt, {
			start: parseDate(salesBusinessDate(saved.paidAt!)),
			end: parseDate(salesBusinessDate(saved.paidAt!)),
		}),
	);
});
test("search and all filters intersect, reset pagination and count units instead of line rows", () => {
	const query = parseSalesSearch({
		period: "month",
		method: "cash",
		cashier: "Alya",
		product: "espresso",
		type: "Dine In",
		q: "meja espresso",
	});
	const range = salesRange(query, date),
		rows = filterSalesOrders(orders, query, range);
	assert.ok(rows.length > 0);
	assert.ok(
		rows.every(
			(o) =>
				o.method === "cash" &&
				o.cashier === "Alya" &&
				o.orderType === "Dine In" &&
				o.items.some((i) => i.productId === "espresso"),
		),
	);
	const many = filterSalesOrders(
		orders,
		parseSalesSearch({ period: "month" }),
		range,
	);
	const first = salesPage(many, 1),
		second = salesPage(many, 2);
	assert.equal(first.rows.length, 20);
	assert.notEqual(first.rows[0].id, second.rows[0].id);
	assert.equal(salesPage([], 99).page, 1);
	assert.ok(orderUnits(first.rows[0]) > first.rows[0].items.length);
});
test("all unpaid dates remain visible but never contribute to revenue or products", () => {
	const query = parseSalesSearch({ period: "day", status: "unpaid" }),
		range = salesRange(query, date);
	const rows = filterSalesOrders(orders, query, range);
	assert.equal(rows.length, 2);
	assert.ok(rows.some((o) => !inSalesRange(o.createdAt, range)));
	assert.equal(summarizeSales(rows, range).netSales, 0);
	assert.equal(summarizeSales(rows, range).netUnits, 0);
	assert.deepEqual(summarizeSales(rows, range).products, []);
});
test("product identities merge snapshots and preserve discount allocation", () => {
	const order = orders.find((o) => o.paidAt && o.discount > 0)!;
	const modified: SalesOrder = {
		...order,
		items: order.items.map((item) => ({ ...item, name: "Nama lama" })),
	};
	const range = {
		start: parseDate(salesBusinessDate(order.paidAt!)),
		end: parseDate(salesBusinessDate(order.paidAt!)),
	};
	const summary = summarizeSales([order, modified], range);
	assert.equal(summary.products.length, order.items.length);
	assert.equal(
		order.items.reduce((s, i) => s + itemTotal(i), 0),
		order.total,
	);
});
test("refund requires paid order/reason/confirmation, persists once and rejects mismatched snapshots", () => {
	const order = orders.find((o) => o.status === "paid")!;
	assert.throws(() => createSalesRefund(order, "", true, now.toISOString()));
	assert.throws(() =>
		createSalesRefund(order, "Salah pesanan", false, now.toISOString()),
	);
	const refund = createSalesRefund(
		order,
		"Salah pesanan",
		true,
		now.toISOString(),
	);
	const next = overlaySalesRefunds(
		orders,
		parseSalesRefunds(JSON.stringify([refund])),
	);
	assert.equal(next.find((o) => o.id === order.id)!.status, "refunded");
	assert.throws(() =>
		createSalesRefund(
			next.find((o) => o.id === order.id)!,
			"Ulang",
			true,
			now.toISOString(),
		),
	);
	assert.throws(() => overlaySalesRefunds(orders, [{ ...refund, amount: 1 }]));
	assert.throws(() => parseSalesRefunds(JSON.stringify([refund, refund])));
	assert.throws(() => parseSalesRefunds("{}"));
});
test("CSV quotes control characters/commas/newlines and neutralizes formulas without turning amounts into text", () => {
	for (const text of ["=1+1", "+SUM(A1)", "-1+2", "@SUM(A1)", "  =1", "\t=1"])
		assert.ok(csvCell(text).startsWith("\"'"));
	assert.equal(csvCell(-12000), "-12000");
	assert.equal(csvCell('Nama, "meja"\n2'), '"Nama, ""meja""\n2"');
	const csv = salesCsv([
		["Order", "Total"],
		["=evil()", 12000],
	]);
	assert.ok(csv.startsWith("\uFEFF"));
	assert.ok(csv.includes("\r\n"));
	assert.ok(csv.includes(",12000"));
});
test("XLSX is real OOXML with numeric cells, safe strings, complete rows and summaries", async () => {
	const { default: ExcelJS } = await import("exceljs");
	const query = parseSalesSearch({ period: "month" }),
		range = salesRange(query, date);
	const rows = filterSalesOrders(orders, query, range),
		summary = summarizeSales(rows, range);
	const unsafe = rows.map((o, i) => (i ? o : { ...o, label: "=1+1" }));
	const bytes = await salesXlsx([
		{
			name: "Ringkasan",
			rows: exportSummaryRows(query, range, summary, rows.length),
		},
		{ name: "Transaksi", rows: transactionExportRows(unsafe, range) },
		{ name: "Rekap Produk", rows: productExportRows(summary.products) },
	]);
	assert.equal(String.fromCharCode(bytes[0], bytes[1]), "PK");
	const book = new ExcelJS.Workbook();
	await book.xlsx.load(bytes as never);
	const sheet = book.getWorksheet("Transaksi")!;
	assert.equal(sheet.rowCount, rows.length + 1);
	assert.ok(rows.length > 20);
	assert.equal(sheet.getCell("E2").value, "=1+1");
	assert.equal(sheet.getCell("E2").type, ExcelJS.ValueType.String);
	assert.equal(typeof sheet.getCell("M2").value, "number");
	assert.equal(book.worksheets.length, 3);
});
