import assert from "node:assert/strict";
import test from "node:test";
import { CalendarDate } from "@internationalized/date";
import { monitorComparison, monitorDelta } from "./monitor-comparison.ts";
import { getMonitorDemoReport, monitorRange } from "./monitor-demo.ts";

test("day/week compare against the preceding WIB calendar day and Monday–Sunday week", () => {
	const date = new CalendarDate(2026, 1, 1);
	const day = monitorComparison("day", monitorRange("day", date));
	assert.equal(day.range.start.toString(), "2025-12-31");
	assert.equal(day.range.end.toString(), "2025-12-31");
	const week = monitorComparison("week", monitorRange("week", date));
	assert.equal(week.range.start.toString(), "2025-12-22");
	assert.equal(week.range.end.toString(), "2025-12-28");
});

test("month/year use the actual preceding calendar boundaries, including leap years", () => {
	const march = monitorComparison(
		"month",
		monitorRange("month", new CalendarDate(2024, 3, 15)),
	);
	assert.equal(march.range.start.toString(), "2024-02-01");
	assert.equal(march.range.end.toString(), "2024-02-29");
	const january = monitorComparison(
		"month",
		monitorRange("month", new CalendarDate(2026, 1, 15)),
	);
	assert.equal(january.range.start.toString(), "2025-12-01");
	assert.equal(january.range.end.toString(), "2025-12-31");
	const year = monitorComparison(
		"year",
		monitorRange("year", new CalendarDate(2025, 5, 1)),
	);
	assert.equal(year.range.start.toString(), "2024-01-01");
	assert.equal(year.range.end.toString(), "2024-12-31");
});

test("custom compares to the immediately preceding interval of equal inclusive length", () => {
	const comparison = monitorComparison("custom", {
		start: new CalendarDate(2026, 10, 10),
		end: new CalendarDate(2026, 10, 12),
	});
	assert.equal(comparison.range.start.toString(), "2026-10-07");
	assert.equal(comparison.range.end.toString(), "2026-10-09");
});

test("delta pills use real percentages, correct direction, and neutral zero baselines", () => {
	assert.deepEqual(monitorDelta(116, 100), {
		delta: "+16%",
		deltaColor: "lime",
	});
	assert.deepEqual(monitorDelta(84, 100), {
		delta: "-16%",
		deltaColor: "rose",
	});
	assert.deepEqual(monitorDelta(100, 100), {
		delta: "0%",
		deltaColor: "neutral",
	});
	assert.deepEqual(monitorDelta(0, 0), { delta: "0%", deltaColor: "neutral" });
	assert.deepEqual(monitorDelta(100, 0), { delta: "—", deltaColor: "neutral" });
	assert.equal(monitorDelta(-50, -100).deltaColor, "lime");
	assert.equal(monitorDelta(-150, -100).deltaColor, "rose");
	assert.equal(monitorDelta(Number.NaN, 100).delta, "—");
});

test("KPI comparisons are derived from their own previous report and do not change current totals", () => {
	const date = new CalendarDate(2026, 10, 17);
	for (const period of ["day", "week", "month", "year"] as const) {
		const range = monitorRange(period, date);
		const current = getMonitorDemoReport(range, date);
		const previous = getMonitorDemoReport(
			monitorComparison(period, range).range,
			date,
		);
		for (const key of [
			"netSales",
			"grossProfit",
			"netProfit",
			"aov",
		] as const) {
			const expected =
				Math.round(
					((current[key] - previous[key]) / Math.abs(previous[key])) * 1000,
				) / 10;
			assert.equal(
				monitorDelta(current[key], previous[key]).deltaColor,
				expected > 0 ? "lime" : expected < 0 ? "rose" : "neutral",
			);
		}
		assert.equal(
			current.netSales,
			current.revenueTrend.reduce((sum, point) => sum + point.current, 0),
		);
	}
});
