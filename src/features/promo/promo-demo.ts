// Frontend preview contract only. Production validation/quotas belong in Supabase RPC.
export type PromoType = "Persen" | "Nominal";
export type PromoStatus =
	| "Aktif"
	| "Terjadwal"
	| "Berakhir"
	| "Nonaktif"
	| "Kuota Habis";
export interface Promo {
	id: string;
	name: string;
	code: string;
	type: PromoType;
	value: number;
	minSpend: number;
	maxDiscount: number | null;
	start: string;
	end: string;
	usageLimit: number | null;
	used: number;
	enabled: boolean;
}
export interface PromoDraft {
	name: string;
	code: string;
	type: PromoType;
	value: string;
	minSpend: string;
	maxDiscount: string;
	start: string;
	end: string;
	usageLimit: string;
	enabled: boolean;
}
export const PROMO_STORAGE_KEY = "alco.promo-demo.v1";
export const PROMO_PAGE_SIZE = 5;
export interface PromoSearch {
	q: string;
	type: "Semua" | PromoType;
	status: "Semua" | PromoStatus;
	page: number;
	readonly: boolean;
}
export function parsePromoSearch(search: Record<string, unknown>): PromoSearch {
	return {
		q: typeof search.q === "string" ? search.q.slice(0, 100) : "",
		type:
			search.type === "Persen" || search.type === "Nominal"
				? search.type
				: "Semua",
		status: [
			"Aktif",
			"Terjadwal",
			"Berakhir",
			"Nonaktif",
			"Kuota Habis",
		].includes(String(search.status))
			? (search.status as PromoStatus)
			: "Semua",
		page:
			Number.isSafeInteger(Number(search.page)) &&
			Number(search.page) > 0 &&
			Number(search.page) <= 100
				? Number(search.page)
				: 1,
		readonly: search.readonly === true || search.readonly === "1",
	};
}
export const money = (value: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);
export function wibNow(date = new Date()) {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		})
			.formatToParts(date)
			.map((part) => [part.type, part.value]),
	);
	return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function promoStatus(promo: Promo, now = wibNow()): PromoStatus {
	if (!promo.enabled) return "Nonaktif";
	if (now > promo.end) return "Berakhir";
	if (now < promo.start) return "Terjadwal";
	if (promo.usageLimit !== null && promo.used >= promo.usageLimit)
		return "Kuota Habis";
	return "Aktif";
}
export function discountPreview(
	promo: Pick<Promo, "type" | "value" | "minSpend" | "maxDiscount">,
	subtotal: number,
) {
	if (
		!Number.isSafeInteger(subtotal) ||
		subtotal < promo.minSpend ||
		subtotal <= 0
	)
		return 0;
	const value =
		promo.type === "Persen"
			? Math.floor((subtotal / 100) * promo.value)
			: promo.value;
	return Math.min(subtotal, value, promo.maxDiscount ?? subtotal);
}
export function emptyPromoDraft(now = wibNow()): PromoDraft {
	return {
		name: "",
		code: "",
		type: "Persen",
		value: "",
		minSpend: "0",
		maxDiscount: "",
		start: `${now.slice(0, 10)}T00:00`,
		end: `${now.slice(0, 10)}T23:59`,
		usageLimit: "",
		enabled: true,
	};
}
export function promoDraft(promo: Promo): PromoDraft {
	return {
		...promo,
		value: String(promo.value),
		minSpend: String(promo.minSpend),
		maxDiscount: promo.maxDiscount === null ? "" : String(promo.maxDiscount),
		usageLimit: promo.usageLimit === null ? "" : String(promo.usageLimit),
	};
}
const validTime = (value: string) =>
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
	Number.isFinite(Date.parse(`${value}:00+07:00`)) &&
	wibNow(new Date(`${value}:00+07:00`)) === value;
const integer = (value: string) =>
	/^\d+$/.test(value) && Number.isSafeInteger(Number(value));
export function validatePromo(
	draft: PromoDraft,
	promos: Promo[],
	editing?: Promo,
): Partial<Record<keyof PromoDraft, string>> {
	const errors: Partial<Record<keyof PromoDraft, string>> = {};
	if (draft.name.trim().length < 2 || draft.name.trim().length > 100)
		errors.name = "Nama harus 2–100 karakter.";
	const code = draft.code.trim().toUpperCase();
	if (!/^[A-Z0-9_-]{3,30}$/.test(code))
		errors.code = "Kode harus 3–30 huruf, angka, _ atau -.";
	else if (
		promos.some(
			(promo) => promo.id !== editing?.id && promo.code.toUpperCase() === code,
		)
	)
		errors.code = "Kode promo sudah digunakan.";
	if (draft.type !== "Persen" && draft.type !== "Nominal")
		errors.type = "Pilih jenis diskon.";
	if (
		!integer(draft.value) ||
		Number(draft.value) <= 0 ||
		(draft.type === "Persen" && Number(draft.value) > 100)
	)
		errors.value =
			draft.type === "Persen"
				? "Persentase harus bilangan bulat 1–100."
				: "Nominal harus rupiah bulat lebih dari 0.";
	if (!integer(draft.minSpend))
		errors.minSpend = "Minimal belanja harus rupiah bulat ≥ 0.";
	if (
		draft.maxDiscount &&
		(!integer(draft.maxDiscount) || Number(draft.maxDiscount) <= 0)
	)
		errors.maxDiscount = "Batas diskon harus rupiah bulat lebih dari 0.";
	if (!validTime(draft.start))
		errors.start = "Isi tanggal dan waktu mulai yang valid.";
	if (!validTime(draft.end) || draft.end <= draft.start)
		errors.end = "Waktu berakhir harus setelah waktu mulai.";
	if (
		draft.usageLimit &&
		(!integer(draft.usageLimit) ||
			Number(draft.usageLimit) <= 0 ||
			Number(draft.usageLimit) < (editing?.used ?? 0))
	)
		errors.usageLimit =
			"Kuota harus bilangan bulat positif dan tidak kurang dari pemakaian.";
	return errors;
}
export function buildPromo(
	draft: PromoDraft,
	promos: Promo[],
	id: string,
	editing?: Promo,
): Promo {
	if (Object.keys(validatePromo(draft, promos, editing)).length)
		throw new Error("Periksa kembali data promo.");
	return {
		id: editing?.id ?? id,
		name: draft.name.trim(),
		code: draft.code.trim().toUpperCase(),
		type: draft.type,
		value: Number(draft.value),
		minSpend: Number(draft.minSpend),
		maxDiscount:
			draft.type === "Persen" && draft.maxDiscount
				? Number(draft.maxDiscount)
				: null,
		start: draft.start,
		end: draft.end,
		usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
		used: editing?.used ?? 0,
		enabled: draft.enabled,
	};
}
export const PROMOS: Promo[] = [
	{
		id: "PRM001",
		name: "Diskon Akhir Pekan",
		code: "WEEKEND20",
		type: "Persen",
		value: 20,
		minSpend: 50000,
		maxDiscount: 20000,
		start: "2026-10-17T00:00",
		end: "2026-10-19T23:59",
		usageLimit: 100,
		used: 12,
		enabled: true,
	},
	{
		id: "PRM002",
		name: "Kopi Hemat",
		code: "KOPIHEMAT",
		type: "Nominal",
		value: 10000,
		minSpend: 50000,
		maxDiscount: null,
		start: "2026-10-01T00:00",
		end: "2026-10-31T23:59",
		usageLimit: null,
		used: 21,
		enabled: true,
	},
	{
		id: "PRM003",
		name: "Diskon Oktober",
		code: "OKTOBER15",
		type: "Persen",
		value: 15,
		minSpend: 30000,
		maxDiscount: 15000,
		start: "2026-10-15T00:00",
		end: "2026-10-18T23:59",
		usageLimit: 50,
		used: 10,
		enabled: true,
	},
	{
		id: "PRM004",
		name: "Promo November",
		code: "NOVEMBER10",
		type: "Persen",
		value: 10,
		minSpend: 75000,
		maxDiscount: null,
		start: "2026-11-01T00:00",
		end: "2026-11-30T23:59",
		usageLimit: 100,
		used: 0,
		enabled: true,
	},
	{
		id: "PRM005",
		name: "Promo Selasa",
		code: "SELASA50",
		type: "Persen",
		value: 50,
		minSpend: 50000,
		maxDiscount: 25000,
		start: "2026-10-20T00:00",
		end: "2026-10-20T23:59",
		usageLimit: 20,
		used: 0,
		enabled: true,
	},
	{
		id: "PRM006",
		name: "Promo Lebaran",
		code: "LEBARAN30",
		type: "Persen",
		value: 30,
		minSpend: 150000,
		maxDiscount: 50000,
		start: "2026-03-01T00:00",
		end: "2026-03-07T23:59",
		usageLimit: 100,
		used: 34,
		enabled: true,
	},
	{
		id: "PRM007",
		name: "Diskon Kopi Pagi",
		code: "PAGI15",
		type: "Persen",
		value: 15,
		minSpend: 25000,
		maxDiscount: 10000,
		start: "2026-09-10T00:00",
		end: "2026-09-12T23:59",
		usageLimit: 100,
		used: 15,
		enabled: false,
	},
	{
		id: "PRM008",
		name: "Promo 17 Agustus",
		code: "AGUSTUS17",
		type: "Persen",
		value: 17,
		minSpend: 100000,
		maxDiscount: 30000,
		start: "2026-08-15T00:00",
		end: "2026-08-20T23:59",
		usageLimit: 100,
		used: 100,
		enabled: true,
	},
];
export function decodePromos(raw: string): Promo[] {
	const data: unknown = JSON.parse(raw);
	if (
		!data ||
		typeof data !== "object" ||
		!("version" in data) ||
		data.version !== 1 ||
		!("promos" in data) ||
		!Array.isArray(data.promos) ||
		data.promos.length > 500
	)
		throw new Error("Data promo lokal tidak valid.");
	const promos = data.promos as Promo[];
	const ids = new Set<string>(),
		codes = new Set<string>();
	for (const promo of promos) {
		if (
			!promo ||
			typeof promo !== "object" ||
			typeof promo.id !== "string" ||
			!promo.id ||
			ids.has(promo.id) ||
			typeof promo.name !== "string" ||
			typeof promo.code !== "string" ||
			codes.has(promo.code.toUpperCase()) ||
			typeof promo.enabled !== "boolean" ||
			!Number.isSafeInteger(promo.used) ||
			promo.used < 0 ||
			!Number.isSafeInteger(promo.value) ||
			!Number.isSafeInteger(promo.minSpend) ||
			(promo.maxDiscount !== null &&
				!Number.isSafeInteger(promo.maxDiscount)) ||
			(promo.usageLimit !== null && !Number.isSafeInteger(promo.usageLimit)) ||
			typeof promo.start !== "string" ||
			typeof promo.end !== "string"
		)
			throw new Error("Data promo lokal tidak valid.");
		if (Object.keys(validatePromo(promoDraft(promo), [], promo)).length)
			throw new Error("Data promo lokal tidak valid.");
		ids.add(promo.id);
		codes.add(promo.code.toUpperCase());
	}
	return promos;
}
export const encodePromos = (promos: Promo[]) =>
	JSON.stringify({ version: 1, promos });
