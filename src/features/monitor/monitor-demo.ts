import {
	CalendarDate,
	endOfMonth,
	endOfWeek,
	endOfYear,
	startOfMonth,
	startOfWeek,
	startOfYear,
	today,
} from "@internationalized/date";

export type MonitorPeriod = "day" | "week" | "month" | "year" | "custom";
export type MonitorRange = { start: CalendarDate; end: CalendarDate };
export type MonitorProduct = {
	name: string;
	category: string;
	units: number;
	revenue: number;
};
export type MonitorPayment = {
	method: "Tunai" | "QRIS Manual" | "Transfer Manual";
	count: number;
	amount: number;
};
export type MonitorPoint = { label: string; current: number; previous: number };
export type MonitorReport = {
	netSales: number;
	grossSales: number;
	cogs: number;
	grossProfit: number;
	netProfit: number;
	paidOrders: number;
	netUnits: number;
	refunds: number;
	refundCount: number;
	aov: number;
	materialExpenses: number;
	operatingExpenses: number;
	products: MonitorProduct[];
	categories: { label: string; value: number; color: string }[];
	payments: MonitorPayment[];
	revenueTrend: MonitorPoint[];
	orderTrend: MonitorPoint[];
	busyHours: MonitorPoint[];
	pending: { count: number; amount: number };
};

export const WIB = "Asia/Jakarta";
const numberFormat = new Intl.NumberFormat("id-ID");
const compactFormat = new Intl.NumberFormat("id-ID", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: WIB,
});
const monthFormat = new Intl.DateTimeFormat("id-ID", {
	month: "short",
	timeZone: WIB,
});
export const rupiah = (value: number) =>
	`Rp${numberFormat.format(Math.round(value))}`;
export const number = (value: number) => numberFormat.format(value);
export const compactRupiah = (value: number) =>
	`Rp${compactFormat.format(value)}`;
export const businessToday = () => today(WIB);

export function monitorRange(
	period: Exclude<MonitorPeriod, "custom">,
	date = businessToday(),
): MonitorRange {
	switch (period) {
		case "day":
			return { start: date, end: date };
		case "week":
			return {
				start: startOfWeek(date, "id-ID", "mon"),
				end: endOfWeek(date, "id-ID", "mon"),
			};
		case "month":
			return { start: startOfMonth(date), end: endOfMonth(date) };
		case "year":
			return { start: startOfYear(date), end: endOfYear(date) };
	}
}

export function formatMonitorRange(range: MonitorRange) {
	const format = (date: CalendarDate) => dateFormat.format(date.toDate(WIB));
	return range.start.compare(range.end) === 0
		? format(range.start)
		: `${format(range.start)} – ${format(range.end)}`;
}

const CATALOG = [
	{
		name: "Kopi Susu Gula Aren",
		category: "Coffee",
		price: 22000,
		cost: 9000,
		quantity: 36,
	},
	{
		name: "Americano",
		category: "Coffee",
		price: 18000,
		cost: 6000,
		quantity: 28,
	},
	{
		name: "Caffè Latte",
		category: "Coffee",
		price: 25000,
		cost: 11000,
		quantity: 22,
	},
	{
		name: "Matcha Latte",
		category: "Non coffee",
		price: 26000,
		cost: 12000,
		quantity: 18,
	},
	{
		name: "Cookies Classic",
		category: "Snack",
		price: 15000,
		cost: 6000,
		quantity: 16,
	},
];
const HOUR_WEIGHTS = [1, 1, 2, 3, 5, 8, 9, 8, 7, 9, 12, 11, 8, 5, 3];
const COLORS = [
	"var(--color-chart-2-active)",
	"var(--color-chart-4-active)",
	"var(--color-chart-5-active)",
];

/** Exact integer allocation: chart bins/payment totals must reconcile with the headline. */
export function allocate(total: number, weights: number[]) {
	const sum = weights.reduce((a, b) => a + b, 0);
	if (!sum) return weights.map(() => 0);
	let allocated = 0;
	return weights.map((weight, index) => {
		const value =
			index === weights.length - 1
				? total - allocated
				: Math.floor((total * weight) / sum);
		allocated += value;
		return value;
	});
}

/** Deterministic UI fixture ONLY. Production supplies the same aggregate DTO from a secured report RPC.
 * No real transaction, raw HPP table, or cash ledger is fetched/aggregated by this preview.
 */
export function getMonitorDemoReport(
	range: MonitorRange,
	cutoff = businessToday(),
): MonitorReport {
	const products = CATALOG.map((product) => ({
		name: product.name,
		category: product.category,
		units: 0,
		revenue: 0,
	}));
	const report: MonitorReport = {
		netSales: 0,
		grossSales: 0,
		cogs: 0,
		grossProfit: 0,
		netProfit: 0,
		paidOrders: 0,
		netUnits: 0,
		refunds: 0,
		refundCount: 0,
		aov: 0,
		materialExpenses: 0,
		operatingExpenses: 0,
		products,
		categories: [],
		payments: ["Tunai", "QRIS Manual", "Transfer Manual"].map((method) => ({
			method: method as MonitorPayment["method"],
			count: 0,
			amount: 0,
		})),
		revenueTrend: [],
		orderTrend: [],
		busyHours: [],
		pending: { count: 7, amount: 498000 },
	};
	const end = range.end.compare(cutoff) > 0 ? cutoff : range.end;
	const grouped = new Map<
		string,
		{ label: string; sales: number; orders: number }
	>();
	const byMonth = range.end.compare(range.start) > 62;
	// The custom picker can span at most a year in this UI preview.
	for (
		let date = range.start;
		date.compare(end) <= 0;
		date = date.add({ days: 1 })
	) {
		const variation = (date.day + date.month) % 4;
		const refundUnits = date.day % 6 === 0 ? 1 : 0;
		let gross = 0,
			cogs = 0,
			units = 0;
		CATALOG.forEach((product, index) => {
			const paid = product.quantity + variation * (index + 1);
			const returned = index === 0 ? refundUnits : 0;
			products[index].units += paid - returned;
			products[index].revenue += (paid - returned) * product.price;
			gross += paid * product.price;
			cogs += (paid - returned) * product.cost;
			units += paid;
		});
		const refunds = refundUnits * CATALOG[0].price;
		const orders = Math.ceil(units / 2);
		report.grossSales += gross;
		report.refunds += refunds;
		report.refundCount += refundUnits;
		report.cogs += cogs;
		report.paidOrders += orders;
		report.netUnits += units - refundUnits;
		report.materialExpenses += 125000 + variation * 10000;
		report.operatingExpenses += 175000 + variation * 5000;
		const counts = allocate(orders, [35, 48, 17]);
		const amounts = allocate(gross / 1000, counts).map((value) => value * 1000);
		report.payments.forEach((payment, index) => {
			payment.count += counts[index];
			payment.amount += amounts[index];
		});
		const key = byMonth ? `${date.year}-${date.month}` : date.toString();
		const label = byMonth
			? monthFormat.format(date.toDate(WIB))
			: `${date.day}/${date.month}`;
		const point = grouped.get(key) ?? { label, sales: 0, orders: 0 };
		point.sales += gross - refunds;
		point.orders += orders;
		grouped.set(key, point);
	}
	report.netSales = report.grossSales - report.refunds;
	report.grossProfit = report.netSales - report.cogs;
	report.netProfit = report.grossProfit - report.operatingExpenses;
	report.aov = report.paidOrders ? report.grossSales / report.paidOrders : 0;
	report.categories = [
		...new Set(products.map((product) => product.category)),
	].map((label, index) => ({
		label,
		value: products
			.filter((product) => product.category === label)
			.reduce((sum, product) => sum + product.units, 0),
		color: COLORS[index],
	}));
	const hours = allocate(report.paidOrders, HOUR_WEIGHTS);
	report.busyHours = hours.map((current, index) => ({
		label: `${String(index + 7).padStart(2, "0")}.00`,
		current,
		previous: 0,
	}));
	if (range.start.compare(range.end) === 0 && report.paidOrders) {
		report.orderTrend = report.busyHours;
		report.revenueTrend = allocate(report.netSales, HOUR_WEIGHTS).map(
			(current, index) => ({
				label: report.busyHours[index].label,
				current,
				previous: 0,
			}),
		);
	} else {
		report.revenueTrend = [...grouped.values()].map((point) => ({
			label: point.label,
			current: point.sales,
			previous: 0,
		}));
		report.orderTrend = [...grouped.values()].map((point) => ({
			label: point.label,
			current: point.orders,
			previous: 0,
		}));
	}
	return report;
}
