import {
	monitorRange,
	type MonitorPeriod,
	type MonitorRange,
} from "./monitor-demo.ts";

/** Previous calendar period in WIB, not a rolling 7/30/365-day approximation. */
export function monitorComparison(period: MonitorPeriod, range: MonitorRange) {
	switch (period) {
		case "day":
			return {
				range: monitorRange("day", range.start.subtract({ days: 1 })),
				caption: "vs kemarin",
			};
		case "week":
			return {
				range: monitorRange("week", range.start.subtract({ weeks: 1 })),
				caption: "vs minggu lalu",
			};
		case "month":
			return {
				range: monitorRange("month", range.start.subtract({ months: 1 })),
				caption: "vs bulan lalu",
			};
		case "year":
			return {
				range: monitorRange("year", range.start.subtract({ years: 1 })),
				caption: "vs tahun lalu",
			};
		case "custom": {
			const days = range.end.compare(range.start) + 1;
			return {
				range: {
					start: range.start.subtract({ days }),
					end: range.start.subtract({ days: 1 }),
				},
				caption: "vs periode lalu",
			};
		}
	}
}

export function monitorDelta(
	current: number,
	previous: number,
): { delta: string; deltaColor: "lime" | "rose" | "neutral" } {
	if (
		!Number.isFinite(current) ||
		!Number.isFinite(previous) ||
		(previous === 0 && current !== 0)
	) {
		return { delta: "—", deltaColor: "neutral" };
	}
	const percent =
		previous === 0
			? 0
			: Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
	if (!Number.isFinite(percent)) return { delta: "—", deltaColor: "neutral" };
	return {
		delta: `${percent > 0 ? "+" : ""}${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, notation: Math.abs(percent) >= 10000 ? "compact" : "standard" }).format(percent)}%`,
		deltaColor: percent > 0 ? "lime" : percent < 0 ? "rose" : "neutral",
	};
}
