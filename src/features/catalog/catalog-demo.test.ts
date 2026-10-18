import assert from "node:assert/strict";
import test from "node:test";
import {
	catalogPage,
	createCatalog,
	decodeCatalog,
	parseRupiah,
	saveCategory,
	saveProduct,
} from "./catalog-demo.ts";

test("fixture category counts reconcile with ten products; round-trip is validated", () => {
	const state = createCatalog();
	assert.equal(state.products.length, 10);
	assert.deepEqual(
		state.categories
			.slice(0, 3)
			.map(
				(category) =>
					state.products.filter((row) => row.categoryId === category.id).length,
			),
		[4, 3, 3],
	);
	assert.deepEqual(decodeCatalog(JSON.stringify(state)), state);
});
test("integer IDR rejects zero price, fractions, exponents, unsafe and negative values", () => {
	assert.equal(parseRupiah("30000", true), 30000);
	assert.equal(parseRupiah("0"), 0);
	for (const value of [
		"0",
		"-1",
		"1.5",
		"1e3",
		"30.000",
		"Infinity",
		"9007199254740992",
	])
		assert.throws(() => parseRupiah(value, true));
});
test("product add/edit keeps identity and allows HPP above price without mutating original", () => {
	const state = createCatalog();
	const original = state.products[0];
	const updated = saveProduct(state, { ...original, price: 100, cost: 200 });
	assert.equal(updated.products.length, 10);
	assert.equal(updated.products[0].id, original.id);
	assert.equal(updated.products[0].cost, 200);
	assert.equal(state.products[0].price, 30000);
	assert.equal(updated.revision, 1);
});
test("names/codes are normalized unique and photo URLs are validated", () => {
	const state = createCatalog();
	assert.throws(() =>
		saveProduct(state, { ...state.products[1], code: " kdp001 " }),
	);
	assert.throws(() =>
		saveProduct(state, { ...state.products[1], name: " espresso " }),
	);
	for (const photo of [
		"javascript:alert(1)",
		"data:image/png;base64,ABC",
		"http://example.com/photo.png",
		"https://user:pass@example.com/x",
	])
		assert.throws(() => saveProduct(state, { ...state.products[0], photo }));
	assert.equal(
		saveProduct(state, {
			...state.products[0],
			photo: "https://example.com/x.png",
		}).products[0].photo,
		"https://example.com/x.png",
	);
});
test("inactive category blocks new product/move but preserves existing associations", () => {
	const state = createCatalog();
	const inactive = saveCategory(state, {
		...state.categories[0],
		active: false,
	});
	assert.throws(() =>
		saveProduct(inactive, { ...state.products[4], categoryId: "cat-1" }),
	);
	assert.throws(() =>
		saveProduct(inactive, {
			...state.products[0],
			id: "new",
			code: "NEW",
			name: "New coffee",
		}),
	);
	const updated = saveProduct(inactive, { ...state.products[0], price: 31000 });
	assert.equal(updated.products[0].price, 31000);
	assert.equal(updated.products[0].active, true);
});
test("deactivation never deletes products and category names/counts follow product IDs", () => {
	const state = createCatalog();
	const updated = saveProduct(state, {
		...state.products[0],
		active: false,
		available: false,
	});
	assert.equal(updated.products.length, state.products.length);
	const renamed = saveCategory(updated, {
		...state.categories[0],
		name: "Kopi",
		order: 99,
	});
	assert.equal(
		renamed.products.filter((row) => row.categoryId === "cat-1").length,
		4,
	);
	assert.equal(renamed.categories.at(-1)?.name, "Kopi");
	assert.throws(() =>
		saveCategory(state, { ...state.categories[1], name: " coffee " }),
	);
	assert.throws(() =>
		saveCategory(state, { ...state.categories[0], order: 0.5 }),
	);
});
test("real pagination clamps after filtering, empty results and boundary page", () => {
	const rows = Array.from({ length: 21 }, (_, index) => index);
	assert.deepEqual(catalogPage(rows, 3).rows, [20]);
	assert.equal(catalogPage(rows, 90).currentPage, 3);
	assert.equal(catalogPage([], 90).totalPages, 1);
	assert.equal(catalogPage(rows.slice(0, 3), 3).currentPage, 1);
});
test("malformed storage rejects schema, duplicates, relations and wrong money types", () => {
	assert.throws(() => decodeCatalog("{broken"));
	assert.throws(() =>
		decodeCatalog(JSON.stringify({ ...createCatalog(), schema: 2 })),
	);
	const duplicate = createCatalog();
	duplicate.products.push(duplicate.products[0]);
	assert.throws(() => decodeCatalog(JSON.stringify(duplicate)));
	const missing = createCatalog();
	missing.products[0].categoryId = "missing";
	assert.throws(() => decodeCatalog(JSON.stringify(missing)));
	const wrong: any = createCatalog();
	wrong.products[0].price = "30000";
	assert.throws(() => decodeCatalog(JSON.stringify(wrong)));
});
