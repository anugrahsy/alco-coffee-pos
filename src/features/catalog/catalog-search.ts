export type CatalogSearch = {
	q: string;
	category: string;
	status: "Semua" | "Aktif" | "Nonaktif";
	availability: "Semua" | "Tersedia" | "Habis";
	page: number;
	size: number;
};
/** Query input is untrusted; preserve only recognized, bounded filter values. */
export function parseCatalogSearch(
	input: Record<string, unknown>,
): CatalogSearch {
	return {
		q: typeof input.q === "string" ? input.q.slice(0, 100) : "",
		category:
			typeof input.category === "string" &&
			/^[\w-]{1,100}$/.test(input.category)
				? input.category
				: "Semua",
		status:
			input.status === "Aktif" || input.status === "Nonaktif"
				? input.status
				: "Semua",
		availability:
			input.availability === "Tersedia" || input.availability === "Habis"
				? input.availability
				: "Semua",
		page:
			Number.isSafeInteger(Number(input.page)) &&
			Number(input.page) > 0 &&
			Number(input.page) <= 10000
				? Number(input.page)
				: 1,
		size: [10, 20, 50].includes(Number(input.size)) ? Number(input.size) : 10,
	};
}
