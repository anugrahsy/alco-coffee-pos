import assert from "node:assert/strict";
import test from "node:test";
import { CalendarDate } from "@internationalized/date";
import {
	allocate,
	getMonitorDemoReport,
	monitorRange,
} from "./monitor-demo.ts";

const date = new CalendarDate(2026, 10, 17);

test("presets use WIB calendar boundaries; a week begins on Monday", () => {
	assert.equal(monitorRange("day", date).start.toString(), "2026-10-17");
	assert.equal(monitorRange("week", date).start.toString(), "2026-10-12");
	assert.equal(monitorRange("week", date).end.toString(), "2026-10-18");
	assert.equal(monitorRange("month", date).start.toString(), "2026-10-01");
	assert.equal(monitorRange("year", date).start.toString(), "2026-01-01");
});

test("every filtered preview reconciles KPI, chart, product, and payment aggregates", () => {
	for (const period of ["day", "week", "month", "year"] as const) {
		const report = getMonitorDemoReport(monitorRange(period, date), date);
		const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
		assert.equal(
			sum(report.revenueTrend.map((point) => point.current)),
			report.netSales,
		);
		assert.equal(
			sum(report.orderTrend.map((point) => point.current)),
			report.paidOrders,
		);
		assert.equal(
			sum(report.busyHours.map((point) => point.current)),
			report.paidOrders,
		);
		assert.equal(
			sum(report.products.map((product) => product.revenue)),
			report.netSales,
		);
		assert.equal(
			sum(report.products.map((product) => product.units)),
			report.netUnits,
		);
		assert.equal(
			sum(report.categories.map((category) => category.value)),
			report.netUnits,
		);
		assert.equal(
			sum(report.payments.map((payment) => payment.amount)),
			report.grossSales,
		);
		assert.equal(
			sum(report.payments.map((payment) => payment.count)),
			report.paidOrders,
		);
		assert.equal(report.netSales, report.grossSales - report.refunds);
		assert.equal(report.grossProfit, report.netSales - report.cogs);
		assert.equal(
			report.netProfit,
			report.grossProfit - report.operatingExpenses,
		);
		assert.equal(report.aov, report.grossSales / report.paidOrders);
		assert.equal(report.pending.count, 7);
		assert.equal(report.pending.amount, 498000);
		assert.ok(report.materialExpenses > 0);
	}
});

test("hour/day/month bins follow the selected period", () => {
	const day = getMonitorDemoReport(monitorRange("day", date), date);
	assert.equal(day.revenueTrend[0].label, "07.00");
	const month = getMonitorDemoReport(monitorRange("month", date), date);
	assert.equal(month.revenueTrend.length, 17);
	assert.equal(month.revenueTrend[0].label, "1/10");
	const year = getMonitorDemoReport(monitorRange("year", date), date);
	assert.equal(year.revenueTrend.length, 10);
	assert.equal(year.revenueTrend[0].label, "Jan");
});

test("future/empty periods do not invent revenue, rankings, or divide by zero; unpaid remains current", () => {
	const future = new CalendarDate(2027, 1, 1);
	const report = getMonitorDemoReport({ start: future, end: future }, date);
	assert.equal(report.netSales, 0);
	assert.equal(report.paidOrders, 0);
	assert.equal(report.aov, 0);
	assert.equal(report.revenueTrend.length, 0);
	assert.equal(report.pending.amount, 498000);
	assert.ok(
		report.payments.every(
			(payment) => payment.count === 0 && payment.amount === 0,
		),
	);
});

test("integer allocation preserves totals, including negative adjustments and zero weights", () => {
	for (const total of [0, 1, 7, 100, 10001, -15000]) {
		assert.equal(
			allocate(total, [35, 48, 17]).reduce((a, b) => a + b, 0),
			total,
		);
	}
	assert.deepEqual(allocate(0, [0, 0]), [0, 0]);
});
