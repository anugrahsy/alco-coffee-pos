import assert from "node:assert/strict";
import test from "node:test";
import { parseCatalogSearch } from "./catalog-search.ts";
test("catalog query accepts only bounded recognized values", () => {
	assert.deepEqual(parseCatalogSearch({}), {
		q: "",
		category: "Semua",
		status: "Semua",
		availability: "Semua",
		page: 1,
		size: 10,
	});
	assert.deepEqual(
		parseCatalogSearch({
			q: "Kopi",
			category: "cat-1",
			status: "Nonaktif",
			availability: "Habis",
			page: "2",
			size: "20",
		}),
		{
			q: "Kopi",
			category: "cat-1",
			status: "Nonaktif",
			availability: "Habis",
			page: 2,
			size: 20,
		},
	);
	const invalid = parseCatalogSearch({
		q: 50,
		category: "/invalid",
		status: "bad",
		availability: "bad",
		page: -1,
		size: 999,
	});
	assert.equal(invalid.page, 1);
	assert.equal(invalid.category, "Semua");
	assert.equal(invalid.size, 10);
});
