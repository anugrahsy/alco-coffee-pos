import { z } from "zod";

// Frontend rehearsal only. Supabase RPC must own all authoritative totals,
// price snapshots, authorization, atomicity and idempotency in production.
const itemSchema = z.object({
	id: z.string().min(1),
	productId: z.string().optional(),
	name: z.string().min(1),
	price: z.number().int().positive().max(100_000_000),
	quantity: z.number().int().min(1).max(99),
	note: z.string().max(200).optional(),
});
const draftSchema = z.object({
	items: z.array(itemSchema).min(1).max(30),
	label: z.string().trim().max(80),
	notes: z.string().max(300),
	promotionCode: z.string().trim().max(30),
});
export type PosDraft = z.infer<typeof draftSchema>;
export type PaymentMethod = "cash" | "qris_manual" | "bank_transfer_manual";
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
	cash: "Tunai",
	qris_manual: "QRIS Manual",
	bank_transfer_manual: "Transfer Manual",
};
const paymentSchema = z.object({
	method: z.enum(["cash", "qris_manual", "bank_transfer_manual"]),
	received: z.number().int().nonnegative(),
	change: z.number().int().nonnegative(),
});
const orderSchema = draftSchema.extend({
	id: z.string().min(1),
	number: z.string().min(1),
	version: z.number().int().positive(),
	status: z.enum(["unpaid", "paid", "cancelled"]),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
	paidAt: z.iso.datetime().optional(),
	subtotal: z.number().int().nonnegative(),
	discount: z.number().int().nonnegative(),
	total: z.number().int().nonnegative(),
	payment: paymentSchema.optional(),
	cancellationReason: z.string().optional(),
});
export type PosDemoOrder = z.infer<typeof orderSchema>;
export type SavedSource = { id: string; version: number };
export const EMPTY_DRAFT: PosDraft = {
	items: [],
	label: "",
	notes: "",
	promotionCode: "",
};
export const DEMO_STORAGE_KEY = "alco-pos-local-demo-v1";

export function money(value: number) {
	return `Rp${value.toLocaleString("id-ID")}`;
}
export function businessDate(value: string | Date) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(value));
}
export function parseStoredOrders(value: string | null): PosDemoOrder[] {
	if (!value) return [];
	return z.array(orderSchema).parse(JSON.parse(value));
}
export function quoteDraft(draft: PosDraft) {
	const parsed = draftSchema.safeParse(draft);
	if (!parsed.success)
		throw new Error(
			"Periksa keranjang: 1–30 produk, jumlah 1–99, serta catatan maksimal 300 karakter.",
		);
	const subtotal = draft.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	if (!Number.isSafeInteger(subtotal))
		throw new Error("Nilai pesanan terlalu besar.");
	const code = draft.promotionCode.trim().toUpperCase();
	if (code && code !== "HEMAT10")
		throw new Error(
			"Kode promo contoh tidak ditemukan. Gunakan HEMAT10 atau hapus kode.",
		);
	if (code && subtotal < 50_000)
		throw new Error(
			"Promo contoh HEMAT10 memerlukan subtotal minimal Rp50.000.",
		);
	const discount = code ? Math.min(Math.floor(subtotal * 0.1), 15_000) : 0;
	return { subtotal, discount, total: subtotal - discount };
}
function existingOrder(orders: PosDemoOrder[], source?: SavedSource) {
	if (!source) return undefined;
	const existing = orders.find((order) => order.id === source.id);
	if (!existing || existing.status !== "unpaid")
		throw new Error(
			"Pesanan ini sudah dibayar/dibatalkan atau tidak tersedia. Muat ulang daftar.",
		);
	if (existing.version !== source.version)
		throw new Error("Pesanan sudah diperbarui. Muat ulang untuk melanjutkan.");
	return existing;
}
export function saveDemoOrder(
	orders: PosDemoOrder[],
	draft: PosDraft,
	source: SavedSource | undefined,
	id: string,
	now: string,
): PosDemoOrder {
	if (!draft.label.trim())
		throw new Error(
			"Isi nama pelanggan, nomor meja, atau label pesanan sebelum menyimpan.",
		);
	const quote = quoteDraft(draft);
	const existing = existingOrder(orders, source);
	return {
		...draft,
		...quote,
		label: draft.label.trim(),
		promotionCode: draft.promotionCode.trim().toUpperCase(),
		items: draft.items.map((item) => ({ ...item })),
		id: existing?.id ?? id,
		number: existing?.number ?? `DEMO-${id.slice(0, 8).toUpperCase()}`,
		status: "unpaid",
		version: (existing?.version ?? 0) + 1,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	};
}
export function checkoutDemoOrder(
	orders: PosDemoOrder[],
	draft: PosDraft,
	source: SavedSource | undefined,
	payment: { method: PaymentMethod; received: string; verified: boolean },
	id: string,
	now: string,
): PosDemoOrder {
	const quote = quoteDraft(draft);
	const existing = existingOrder(orders, source);
	let received = quote.total;
	if (payment.method === "cash") {
		if (!/^\d+$/.test(payment.received))
			throw new Error(
				"Uang diterima harus berupa rupiah bulat tanpa tanda atau desimal.",
			);
		received = Number(payment.received);
		if (!Number.isSafeInteger(received) || received < quote.total)
			throw new Error("Uang diterima belum mencukupi total tagihan.");
	} else if (!payment.verified)
		throw new Error(
			"Konfirmasikan dana sudah diterima sebelum melanjutkan simulasi.",
		);
	return {
		...draft,
		...quote,
		label: draft.label.trim(),
		items: draft.items.map((item) => ({ ...item })),
		id: existing?.id ?? id,
		number: existing?.number ?? `DEMO-${id.slice(0, 8).toUpperCase()}`,
		version: (existing?.version ?? 0) + 1,
		status: "paid",
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
		paidAt: now,
		payment: {
			method: payment.method,
			received,
			change: received - quote.total,
		},
	};
}
export function cancelDemoOrder(
	orders: PosDemoOrder[],
	source: SavedSource,
	reason: string,
	now: string,
): PosDemoOrder {
	const existing = existingOrder(orders, source)!;
	if (!reason.trim()) throw new Error("Alasan pembatalan wajib diisi.");
	return {
		...existing,
		status: "cancelled",
		version: existing.version + 1,
		updatedAt: now,
		cancellationReason: reason.trim(),
	};
}
export function replaceOrder(orders: PosDemoOrder[], order: PosDemoOrder) {
	return [order, ...orders.filter((item) => item.id !== order.id)];
}
