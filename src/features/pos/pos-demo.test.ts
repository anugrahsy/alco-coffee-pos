import assert from "node:assert/strict";
import test from "node:test";
import {
	businessDate,
	cancelDemoOrder,
	checkoutDemoOrder,
	parseStoredOrders,
	quoteDraft,
	replaceOrder,
	saveDemoOrder,
	type PosDraft,
} from "./pos-demo.ts";
const now = "2026-10-17T12:00:00.000Z";
const draft: PosDraft = {
	items: [{ id: "kopi", name: "Kopi", price: 18000, quantity: 2 }],
	label: "Meja 4",
	notes: "",
	promotionCode: "",
};
test("WIB business date crosses midnight independently of the browser timezone", () => {
	assert.equal(businessDate("2026-10-17T16:59:59.000Z"), "2026-10-17");
	assert.equal(businessDate("2026-10-17T17:00:00.000Z"), "2026-10-18");
});
test("save/edit/pay retain the same order ID and price snapshot", () => {
	const saved = saveDemoOrder([], draft, undefined, "first-id", now);
	const edited = saveDemoOrder(
		[saved],
		{ ...saved, items: [{ ...saved.items[0], quantity: 3 }] },
		{ id: saved.id, version: 1 },
		"unused-id",
		now,
	);
	const paid = checkoutDemoOrder(
		[edited],
		edited,
		{ id: edited.id, version: 2 },
		{ method: "cash", received: "100000", verified: false },
		"unused-id",
		now,
	);
	assert.equal(paid.id, saved.id);
	assert.equal(paid.total, 54000);
	assert.equal(paid.payment?.change, 46000);
	assert.equal(replaceOrder([edited], paid).length, 1);
	assert.throws(
		() =>
			checkoutDemoOrder(
				[paid],
				paid,
				{ id: paid.id, version: 3 },
				{ method: "cash", received: "100000", verified: false },
				"duplicate",
				now,
			),
		/sudah dibayar/,
	);
});
test("cash rejects insufficient, fractional, negative or unsafe tender", () => {
	for (const received of [
		"10000",
		"36000.5",
		"-100",
		"1e6",
		"9007199254740993",
		"",
	]) {
		assert.throws(() =>
			checkoutDemoOrder(
				[],
				draft,
				undefined,
				{ method: "cash", received, verified: false },
				"id",
				now,
			),
		);
	}
});
test("manual QRIS and transfer require explicit received-funds confirmation", () => {
	for (const method of ["qris_manual", "bank_transfer_manual"] as const) {
		assert.throws(() =>
			checkoutDemoOrder(
				[],
				draft,
				undefined,
				{ method, received: "", verified: false },
				"id",
				now,
			),
		);
		assert.equal(
			checkoutDemoOrder(
				[],
				draft,
				undefined,
				{ method, received: "", verified: true },
				"id",
				now,
			).payment?.change,
			0,
		);
	}
});
test("saved label, quantity bounds, conflict and cancellation reason are checked", () => {
	assert.throws(() =>
		saveDemoOrder([], { ...draft, label: "  " }, undefined, "id", now),
	);
	assert.throws(() =>
		quoteDraft({ ...draft, items: [{ ...draft.items[0], quantity: 100 }] }),
	);
	const saved = saveDemoOrder([], draft, undefined, "id", now);
	assert.throws(
		() => saveDemoOrder([saved], draft, { id: "id", version: 2 }, "id", now),
		/diperbarui/,
	);
	assert.throws(() =>
		cancelDemoOrder([saved], { id: "id", version: 1 }, "", now),
	);
	assert.equal(
		cancelDemoOrder([saved], { id: "id", version: 1 }, "Pelanggan batal", now)
			.status,
		"cancelled",
	);
});
test("demo promo has a minimum, cap and integer totals; stored data is validated", () => {
	assert.throws(() => quoteDraft({ ...draft, promotionCode: "HEMAT10" }));
	const quote = quoteDraft({
		...draft,
		items: [{ ...draft.items[0], quantity: 20 }],
		promotionCode: "HEMAT10",
	});
	assert.deepEqual(quote, { subtotal: 360000, discount: 15000, total: 345000 });
	const saved = saveDemoOrder([], draft, undefined, "id", now);
	assert.equal(parseStoredOrders(JSON.stringify([saved]))[0].id, "id");
	assert.throws(() => parseStoredOrders('{"untrusted":true}'));
});
