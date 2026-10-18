import { CalendarDate, parseDate } from "@internationalized/date";
import {
	monitorRange,
	type MonitorPeriod,
	type MonitorRange,
} from "../monitor/monitor-demo.ts";

// UI rehearsal only. Production must return these DTOs from authorized,
// paginated Supabase reports. Never use this fixture as a financial ledger.
export const SALES_WIB = "Asia/Jakarta";
export const SALES_REFUNDS_KEY = "alco-sales-refunds-demo-v1";
export const SALES_PAGE_SIZE = 20;
export const PAYMENT_LABELS = {
	cash: "Tunai",
	qris_manual: "QRIS Manual",
	bank_transfer_manual: "Transfer Manual",
} as const;
export const STATUS_LABELS = {
	paid: "Lunas",
	refunded: "Dikembalikan",
	unpaid: "Belum Dibayar",
	cancelled: "Dibatalkan",
} as const;
export type SalesMethod = keyof typeof PAYMENT_LABELS;
export type SalesStatus = keyof typeof STATUS_LABELS;
export type SalesItem = {
	productId: string;
	name: string;
	quantity: number;
	unitPrice: number;
	discount: number;
};
export type SalesRefund = {
	orderId: string;
	at: string;
	amount: number;
	reason: string;
	actor: string;
};
export type SalesOrder = {
	id: string;
	number: string;
	label: string;
	cashier: string;
	createdAt: string;
	paidAt: string | null;
	method: SalesMethod | null;
	status: SalesStatus;
	orderType: "Dine In" | "Take Away";
	items: SalesItem[];
	subtotal: number;
	discount: number;
	total: number;
	notes: string;
	refund?: SalesRefund;
};
export type SalesSearch = {
	period: MonitorPeriod;
	from: string;
	to: string;
	method: string;
	status: string;
	cashier: string;
	product: string;
	type: string;
	q: string;
	page: number;
	order: string;
};
export type ProductRecap = {
	id: string;
	name: string;
	paidUnits: number;
	refundUnits: number;
	netUnits: number;
	revenue: number;
};
export const SALES_PRODUCTS = [
	{ id: "espresso", name: "Espresso", price: 30000 },
	{ id: "croissant", name: "Croissant", price: 25000 },
	{ id: "latte", name: "Caffe Latte", price: 32000 },
	{ id: "chocolat", name: "Pain au Chocolat", price: 28000 },
	{ id: "cookies", name: "Cookies", price: 14000 },
	{ id: "bowl", name: "Nasi Bowl", price: 50000 },
	{ id: "tea", name: "Ice Tea", price: 20000 },
	{ id: "americano", name: "Americano", price: 20000 },
	{ id: "cake", name: "Cheese Cake", price: 64000 },
	{ id: "chocolate", name: "Hot Chocolate", price: 32000 },
	{ id: "tiramisu", name: "Tiramisu", price: 42000 },
	{ id: "caramel", name: "Caramel Machiato", price: 30000 },
] as const;
export const SALES_CASHIERS = ["Alya", "Bima", "Citra"];
const moneyFormat = new Intl.NumberFormat("id-ID");
export const salesMoney = (value: number) => `Rp${moneyFormat.format(value)}`;
export const salesNumber = (value: number) => moneyFormat.format(value);
const businessFormat = new Intl.DateTimeFormat("en-CA", {
	timeZone: SALES_WIB,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("id-ID", {
	timeZone: SALES_WIB,
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
});
const dateFormat = new Intl.DateTimeFormat("id-ID", {
	timeZone: SALES_WIB,
	day: "numeric",
	month: "short",
	year: "numeric",
});
export function salesBusinessDate(value: string | Date) {
	return businessFormat.format(new Date(value));
}
export function salesTime(value: string) {
	return timeFormat.format(new Date(value));
}
export function salesDate(value: string) {
	return dateFormat.format(new Date(value));
}
const option = (
	value: unknown,
	choices: readonly string[],
	fallback: string,
) => (typeof value === "string" && choices.includes(value) ? value : fallback);
export function parseSalesSearch(input: Record<string, unknown>): SalesSearch {
	let period = option(
		input.period,
		["day", "week", "month", "year", "custom"],
		"month",
	) as MonitorPeriod;
	let from = "",
		to = "";
	if (period === "custom") {
		try {
			if (typeof input.from !== "string" || typeof input.to !== "string")
				throw new Error();
			const start = parseDate(input.from),
				end = parseDate(input.to);
			if (
				start.year < 1900 ||
				end.year > 2100 ||
				end.compare(start) < 0 ||
				end.compare(start) > 365
			)
				throw new Error();
			from = start.toString();
			to = end.toString();
		} catch {
			period = "month";
		}
	}
	return {
		period,
		from,
		to,
		method: option(
			input.method,
			["all", ...Object.keys(PAYMENT_LABELS)],
			"all",
		),
		status: option(
			input.status,
			["sales", "all", ...Object.keys(STATUS_LABELS)],
			"sales",
		),
		cashier: option(input.cashier, ["all", ...SALES_CASHIERS], "all"),
		product: option(
			input.product,
			["all", ...SALES_PRODUCTS.map((p) => p.id)],
			"all",
		),
		type: option(input.type, ["all", "Dine In", "Take Away"], "all"),
		q: typeof input.q === "string" ? input.q.slice(0, 120) : "",
		page:
			Number.isSafeInteger(Number(input.page)) && Number(input.page) > 0
				? Math.min(Number(input.page), 100000)
				: 1,
		order: typeof input.order === "string" ? input.order.slice(0, 80) : "",
	};
}
export function salesRange(
	search: SalesSearch,
	date: CalendarDate,
): MonitorRange {
	return search.period === "custom"
		? { start: parseDate(search.from), end: parseDate(search.to) }
		: monitorRange(search.period, date);
}
export function inSalesRange(
	at: string | null | undefined,
	range: MonitorRange,
) {
	if (!at) return false;
	const date = salesBusinessDate(at);
	return date >= range.start.toString() && date <= range.end.toString();
}
export const itemTotal = (item: SalesItem) =>
	item.quantity * item.unitPrice - item.discount;
export const orderUnits = (order: SalesOrder) =>
	order.items.reduce((sum, item) => sum + item.quantity, 0);

/** Stable identities/dates: the same order is identical across every preset. */
export function makeSalesDemoOrders(now: Date): SalesOrder[] {
	const cutoff = parseDate(salesBusinessDate(now));
	const first = new CalendarDate(cutoff.year - 1, 1, 1);
	const orders: SalesOrder[] = [];
	const pairs = [
		[0, 1],
		[2, 3],
		[0, 4],
		[5, 6],
		[7, 1],
		[2, 8],
		[9, 10],
		[0, 5],
		[11, 7],
	];
	for (let day = first; day.compare(cutoff) <= 0; day = day.add({ days: 1 })) {
		const seed = day.day + day.month;
		pairs.forEach((pair, index) => {
			const paidAt = `${day}T${String(8 + index).padStart(2, "0")}:30:00+07:00`;
			if (new Date(paidAt) > now) return;
			const id = `demo-${day}-${index}`;
			const items = pair.map((productIndex, line) => {
				const p = SALES_PRODUCTS[productIndex];
				const quantity = 1 + ((seed + index + line) % 3);
				return {
					productId: p.id,
					name: p.name,
					quantity,
					unitPrice: p.price,
					discount: index === 2 && line === 0 ? 3000 : 0,
				};
			});
			const subtotal = items.reduce(
				(sum, item) => sum + item.quantity * item.unitPrice,
				0,
			);
			const discount = items.reduce((sum, item) => sum + item.discount, 0);
			const order: SalesOrder = {
				id,
				number: `#COF-${day.toString().replaceAll("-", "")}-${index + 1}`,
				label: index % 2 ? "Pelanggan langsung" : `Meja ${index + 1}`,
				cashier: SALES_CASHIERS[index % 3],
				createdAt: `${day.subtract({ days: index === 7 ? 1 : 0 })}T07:30:00+07:00`,
				paidAt,
				method: (["cash", "qris_manual", "bank_transfer_manual"] as const)[
					index % 3
				],
				status: "paid",
				orderType: index % 2 ? "Take Away" : "Dine In",
				items,
				subtotal,
				discount,
				total: subtotal - discount,
				notes: index === 0 ? "Tanpa gula tambahan" : "",
			};
			// Full refund is a separate event, sometimes across month/year boundaries.
			const refundAt = `${day.add({ days: 2 })}T10:15:00+07:00`;
			if (index === 1 && day.day % 4 === 0 && new Date(refundAt) <= now) {
				order.status = "refunded";
				order.refund = {
					orderId: id,
					at: refundAt,
					amount: order.total,
					reason: "Contoh pembatalan setelah pembayaran",
					actor: "Admin Demo",
				};
			}
			orders.push(order);
		});
	}
	[1, 40].forEach((days, index) => {
		const date = cutoff.subtract({ days });
		orders.push({
			id: `unpaid-demo-${index}`,
			number: `#SIMPAN-DEMO-${index + 1}`,
			label: `Meja ${20 + index}`,
			cashier: SALES_CASHIERS[index],
			createdAt: `${date}T14:00:00+07:00`,
			paidAt: null,
			method: null,
			status: "unpaid",
			orderType: "Dine In",
			items: [
				{
					productId: "espresso",
					name: "Espresso",
					quantity: 2,
					unitPrice: 30000,
					discount: 0,
				},
			],
			subtotal: 60000,
			discount: 0,
			total: 60000,
			notes: "Contoh unpaid lintas hari; bukan pembayaran.",
		});
	});
	const cancelled = {
		...orders[orders.length - 1],
		id: "cancelled-demo",
		number: "#BATAL-DEMO",
		status: "cancelled" as const,
		createdAt: `${cutoff}T06:00:00+07:00`,
		notes: "Contoh dibatalkan: pelanggan tidak melanjutkan pesanan.",
	};
	orders.push(cancelled);
	return orders;
}

/** Filters describe orders. Product means 'orders containing this product',
 * not an item-only subtotal; all report widgets/export share this scope. */
export function filterSalesOrders(
	orders: SalesOrder[],
	search: SalesSearch,
	range: MonitorRange,
) {
	const words = search.q
		.toLocaleLowerCase("id-ID")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return orders
		.filter((order) => {
			const statusMatches =
				search.status === "all" ||
				(search.status === "sales"
					? order.status === "paid" || order.status === "refunded"
					: order.status === search.status);
			const dateMatches =
				order.status === "unpaid" ||
				(order.paidAt
					? inSalesRange(order.paidAt, range) ||
						inSalesRange(order.refund?.at, range)
					: inSalesRange(order.createdAt, range));
			const haystack = [
				order.number,
				order.label,
				order.cashier,
				...order.items.map((item) => item.name),
			]
				.join(" ")
				.toLocaleLowerCase("id-ID");
			return (
				statusMatches &&
				dateMatches &&
				(search.method === "all" || order.method === search.method) &&
				(search.cashier === "all" || order.cashier === search.cashier) &&
				(search.product === "all" ||
					order.items.some((item) => item.productId === search.product)) &&
				(search.type === "all" || order.orderType === search.type) &&
				words.every((word) => haystack.includes(word))
			);
		})
		.sort(
			(a, b) =>
				Date.parse(b.refund?.at ?? b.paidAt ?? b.createdAt) -
					Date.parse(a.refund?.at ?? a.paidAt ?? a.createdAt) ||
				a.id.localeCompare(b.id),
		);
}
export function summarizeSales(orders: SalesOrder[], range: MonitorRange) {
	let receipts = 0,
		paidOrders = 0,
		paidUnits = 0,
		refunds = 0,
		refundUnits = 0,
		refundCount = 0;
	const products = new Map<string, ProductRecap>();
	for (const order of orders) {
		const sale = inSalesRange(order.paidAt, range);
		const returned = inSalesRange(order.refund?.at, range);
		if (!sale && !returned) continue;
		if (sale) {
			receipts += order.total;
			paidOrders++;
			paidUnits += orderUnits(order);
		}
		if (returned) {
			refunds += order.refund!.amount;
			refundCount++;
			refundUnits += orderUnits(order);
		}
		for (const item of order.items) {
			const p = products.get(item.productId) ?? {
				id: item.productId,
				name:
					SALES_PRODUCTS.find((p) => p.id === item.productId)?.name ??
					item.name,
				paidUnits: 0,
				refundUnits: 0,
				netUnits: 0,
				revenue: 0,
			};
			if (sale) {
				p.paidUnits += item.quantity;
				p.revenue += itemTotal(item);
			}
			if (returned) {
				p.refundUnits += item.quantity;
				p.revenue -= itemTotal(item);
			}
			p.netUnits = p.paidUnits - p.refundUnits;
			products.set(item.productId, p);
		}
	}
	return {
		receipts,
		paidOrders,
		paidUnits,
		refunds,
		refundCount,
		refundUnits,
		netSales: receipts - refunds,
		netUnits: paidUnits - refundUnits,
		products: [...products.values()].sort(
			(a, b) =>
				b.netUnits - a.netUnits ||
				b.revenue - a.revenue ||
				a.name.localeCompare(b.name, "id-ID"),
		),
	};
}
export function salesPage(rows: SalesOrder[], requested: number) {
	const pages = Math.max(1, Math.ceil(rows.length / SALES_PAGE_SIZE));
	const page = Math.max(1, Math.min(requested, pages));
	return {
		page,
		pages,
		rows: rows.slice((page - 1) * SALES_PAGE_SIZE, page * SALES_PAGE_SIZE),
	};
}
export function parseSalesRefunds(value: string | null): SalesRefund[] {
	if (value === null) return [];
	const data: unknown = JSON.parse(value);
	if (!Array.isArray(data) || data.length > 50000)
		throw new Error("Data refund contoh tidak valid.");
	const ids = new Set<string>();
	return data.map((item) => {
		if (
			!item ||
			typeof item.orderId !== "string" ||
			ids.has(item.orderId) ||
			typeof item.at !== "string" ||
			!Number.isFinite(Date.parse(item.at)) ||
			!Number.isSafeInteger(item.amount) ||
			item.amount <= 0 ||
			typeof item.reason !== "string" ||
			!item.reason.trim() ||
			item.reason.length > 300 ||
			item.actor !== "Admin Demo"
		)
			throw new Error("Data refund contoh tidak valid.");
		ids.add(item.orderId);
		return {
			orderId: item.orderId,
			at: item.at,
			amount: item.amount,
			reason: item.reason,
			actor: item.actor,
		};
	});
}
export function overlaySalesRefunds(
	orders: SalesOrder[],
	refunds: SalesRefund[],
) {
	const byId = new Map(refunds.map((r) => [r.orderId, r]));
	return orders.map((order) => {
		const refund = byId.get(order.id);
		if (!refund) return order;
		if (
			!order.paidAt ||
			refund.amount !== order.total ||
			new Date(refund.at) < new Date(order.paidAt)
		)
			throw new Error(
				"Refund contoh tidak cocok dengan pesanan. Data lokal tidak ditimpa.",
			);
		return { ...order, status: "refunded" as const, refund };
	});
}
export function createSalesRefund(
	order: SalesOrder,
	reason: string,
	confirmed: boolean,
	at: string,
): SalesRefund {
	if (order.status !== "paid" || !order.paidAt)
		throw new Error(
			"Hanya pesanan lunas yang belum direfund dapat dikembalikan.",
		);
	if (!reason.trim() || reason.trim().length > 300)
		throw new Error("Alasan refund wajib diisi, maksimal 300 karakter.");
	if (!confirmed)
		throw new Error(
			"Konfirmasikan dana sudah dikembalikan melalui metode pembayaran asal.",
		);
	if (!Number.isFinite(Date.parse(at)) || new Date(at) < new Date(order.paidAt))
		throw new Error("Waktu refund tidak valid.");
	return {
		orderId: order.id,
		at,
		amount: order.total,
		reason: reason.trim(),
		actor: "Admin Demo",
	};
}
