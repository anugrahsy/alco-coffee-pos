/** Frontend-only master-data fixture. Replace this boundary with admin-only RPCs. */
export type CatalogCategory = {
	id: string;
	code: string;
	name: string;
	description: string;
	active: boolean;
	order: number;
};
export type CatalogProduct = {
	id: string;
	code: string;
	name: string;
	categoryId: string;
	price: number;
	cost: number;
	active: boolean;
	available: boolean;
	photo: string;
};
export type CatalogState = {
	schema: 1;
	revision: number;
	categories: CatalogCategory[];
	products: CatalogProduct[];
};
export const CATALOG_KEY = "alco.catalog.demo.v1";
export const CATALOG_EVENT = "alco:catalog-demo";
export const catalogMoney = (value: number) =>
	`Rp${value.toLocaleString("id-ID")}`;
const clean = (value: string) => value.trim().normalize("NFKC");
const normalized = (value: string) => clean(value).toLocaleLowerCase("id-ID");

export function createCatalog(): CatalogState {
	const categories: CatalogCategory[] = [
		["Coffee", "Minuman berbasis kopi", true],
		["Non Coffee", "Minuman non kopi", true],
		["Snack", "Makanan ringan", true],
		["Dessert", "Makanan penutup", false],
		["Main Course", "Makanan utama", true],
		["Add-ons", "Sirup, topping, tambahan", false],
	].map(([name, description, active], index) => ({
		id: `cat-${index + 1}`,
		code: `KTG00${index + 1}`,
		name: String(name),
		description: String(description),
		active: Boolean(active),
		order: index + 1,
	}));
	const seed: [string, number, number, number, boolean][] = [
		["Espresso", 1, 30000, 12000, true],
		["Caffe Latte", 1, 35000, 14000, true],
		["Americano", 1, 25000, 9000, true],
		["Cappuccino", 1, 38000, 15000, true],
		["Matcha Latte", 2, 32000, 13000, true],
		["Ice Tea", 2, 15000, 5000, true],
		["Chocolate", 2, 30000, 11000, false],
		["Croissant", 3, 25000, 10000, true],
		["Cheese Cake", 3, 42000, 18000, true],
		["Cookies", 3, 20000, 8000, false],
	];
	return {
		schema: 1,
		revision: 0,
		categories,
		products: seed.map(([name, category, price, cost, active], index) => ({
			id: `product-${index + 1}`,
			code: `KDP${String(index + 1).padStart(3, "0")}`,
			name,
			categoryId: `cat-${category}`,
			price,
			cost,
			active,
			available: true,
			photo: "",
		})),
	};
}

export function parseRupiah(value: string, positive = false): number {
	if (!/^\d+$/.test(value.trim()))
		throw new Error(
			"Nominal harus berupa rupiah bulat, tanpa tanda titik, desimal, atau eksponen.",
		);
	const amount = Number(value);
	if (
		!Number.isSafeInteger(amount) ||
		amount < (positive ? 1 : 0) ||
		amount > 1_000_000_000
	)
		throw new Error(
			positive
				? "Harga harus lebih dari Rp0 dan maksimal Rp1.000.000.000."
				: "HPP harus minimal Rp0 dan maksimal Rp1.000.000.000.",
		);
	return amount;
}

export function validateCategory(
	state: CatalogState,
	value: CatalogCategory,
): CatalogCategory {
	const item = {
		...value,
		name: clean(value.name),
		code: clean(value.code).toUpperCase(),
		description: value.description.trim(),
	};
	if (item.name.length < 2 || item.name.length > 100)
		throw new Error("Nama kategori harus 2–100 karakter.");
	if (!/^[A-Z0-9_-]{2,32}$/.test(item.code))
		throw new Error(
			"Kode kategori harus 2–32 huruf, angka, tanda hubung, atau garis bawah.",
		);
	if (item.description.length > 300)
		throw new Error("Deskripsi maksimal 300 karakter.");
	if (!Number.isSafeInteger(item.order) || item.order < 0 || item.order > 9999)
		throw new Error("Urutan harus bilangan bulat 0–9999.");
	if (
		state.categories.some(
			(row) =>
				row.id !== item.id &&
				(normalized(row.name) === normalized(item.name) ||
					normalized(row.code) === normalized(item.code)),
		)
	)
		throw new Error("Nama atau kode kategori sudah digunakan.");
	return item;
}

export function validateProduct(
	state: CatalogState,
	value: CatalogProduct,
): CatalogProduct {
	const item = {
		...value,
		name: clean(value.name),
		code: clean(value.code).toUpperCase(),
		photo: value.photo.trim(),
	};
	if (item.name.length < 2 || item.name.length > 100)
		throw new Error("Nama produk harus 2–100 karakter.");
	if (!/^[A-Z0-9_-]{2,32}$/.test(item.code))
		throw new Error(
			"Kode produk harus 2–32 huruf, angka, tanda hubung, atau garis bawah.",
		);
	if (
		state.products.some(
			(row) =>
				row.id !== item.id &&
				(normalized(row.code) === normalized(item.code) ||
					normalized(row.name) === normalized(item.name)),
		)
	)
		throw new Error("Nama atau kode produk sudah digunakan.");
	parseRupiah(String(item.price), true);
	parseRupiah(String(item.cost));
	const category = state.categories.find((row) => row.id === item.categoryId);
	const original = state.products.find((row) => row.id === item.id);
	if (!category || (!category.active && original?.categoryId !== category.id))
		throw new Error(
			"Pilih kategori aktif untuk produk baru atau perpindahan kategori.",
		);
	if (item.photo) {
		let url: URL;
		try {
			url = new URL(item.photo);
		} catch {
			throw new Error("Foto harus berupa URL HTTPS yang valid.");
		}
		if (
			url.protocol !== "https:" ||
			url.username ||
			url.password ||
			item.photo.length > 2048
		)
			throw new Error(
				"Foto harus berupa URL HTTPS tanpa kredensial, maksimal 2048 karakter.",
			);
	}
	return item;
}

export function saveCategory(
	state: CatalogState,
	value: CatalogCategory,
): CatalogState {
	const item = validateCategory(state, value);
	return {
		...state,
		revision: state.revision + 1,
		categories: [
			...state.categories.filter((row) => row.id !== item.id),
			item,
		].sort(
			(a, b) => a.order - b.order || a.name.localeCompare(b.name, "id-ID"),
		),
	};
}
export function saveProduct(
	state: CatalogState,
	value: CatalogProduct,
): CatalogState {
	const item = validateProduct(state, value);
	return {
		...state,
		revision: state.revision + 1,
		products: state.products.some((row) => row.id === item.id)
			? state.products.map((row) => (row.id === item.id ? item : row))
			: [...state.products, item],
	};
}
export function catalogPage<T>(rows: T[], page: number, size = 10) {
	const totalPages = Math.max(1, Math.ceil(rows.length / size));
	const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
	return {
		rows: rows.slice((currentPage - 1) * size, currentPage * size),
		currentPage,
		totalPages,
	};
}

/** Validate untrusted browser storage; malformed data is never silently replaced. */
export function decodeCatalog(raw: string): CatalogState {
	const candidate: unknown = JSON.parse(raw);
	if (!candidate || typeof candidate !== "object")
		throw new Error("Data katalog lokal tidak valid.");
	const state = candidate as CatalogState;
	if (
		state.schema !== 1 ||
		!Number.isSafeInteger(state.revision) ||
		state.revision < 0 ||
		!Array.isArray(state.categories) ||
		!Array.isArray(state.products) ||
		state.products.length > 1000 ||
		state.categories.length > 200
	)
		throw new Error("Format katalog lokal tidak didukung.");
	for (const category of state.categories) {
		if (
			!category ||
			typeof category.id !== "string" ||
			!category.id ||
			typeof category.name !== "string" ||
			typeof category.code !== "string" ||
			typeof category.description !== "string" ||
			typeof category.active !== "boolean"
		)
			throw new Error("Kategori lokal tidak valid.");
		validateCategory(state, category);
	}
	for (const product of state.products) {
		if (
			!product ||
			typeof product.id !== "string" ||
			!product.id ||
			typeof product.name !== "string" ||
			typeof product.code !== "string" ||
			typeof product.categoryId !== "string" ||
			typeof product.price !== "number" ||
			typeof product.cost !== "number" ||
			typeof product.photo !== "string" ||
			typeof product.active !== "boolean" ||
			typeof product.available !== "boolean"
		)
			throw new Error("Produk lokal tidak valid.");
		validateProduct(state, product);
	}
	for (const rows of [state.categories, state.products])
		if (
			new Set(rows.map((row) => row.id)).size !== rows.length ||
			new Set(rows.map((row) => normalized(row.code))).size !== rows.length ||
			new Set(rows.map((row) => normalized(row.name))).size !== rows.length
		)
			throw new Error("Identitas katalog lokal duplikat.");
	return state;
}
