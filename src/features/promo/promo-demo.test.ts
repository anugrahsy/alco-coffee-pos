import assert from "node:assert/strict";
import { test } from "node:test";
import {
	buildPromo,
	decodePromos,
	discountPreview,
	emptyPromoDraft,
	encodePromos,
	parsePromoSearch,
	PROMOS,
	promoDraft,
	promoStatus,
	validatePromo,
	wibNow,
} from "./promo-demo.ts";

const draft = () => ({
	...emptyPromoDraft("2026-10-17T12:00"),
	name: "Promo QA",
	code: "QA10",
	value: "10",
});
test("untrusted query params normalize to bounded safe filters", () => {
	assert.deepEqual(
		parsePromoSearch({ q: 42, type: "bad", status: "paid", page: -1 }),
		{ q: "", type: "Semua", status: "Semua", page: 1 },
	);
	assert.deepEqual(
		parsePromoSearch({
			q: "kopi",
			type: "Nominal",
			status: "Aktif",
			page: "2",
		}),
		{ q: "kopi", type: "Nominal", status: "Aktif", page: 2 },
	);
	assert.equal(
		parsePromoSearch({ q: "x".repeat(200), page: Infinity }).q.length,
		100,
	);
});
test("WIB boundary and dynamic schedule/expiry/disabled/exhausted status", () => {
	assert.equal(wibNow(new Date("2026-10-16T17:01:00Z")), "2026-10-17T00:01");
	const promo = PROMOS[0];
	assert.equal(promoStatus(promo, "2026-10-16T23:59"), "Terjadwal");
	assert.equal(promoStatus(promo, promo.start), "Aktif");
	assert.equal(promoStatus(promo, promo.end), "Aktif");
	assert.equal(promoStatus(promo, "2026-10-20T00:00"), "Berakhir");
	assert.equal(
		promoStatus({ ...promo, used: 100 }, "2026-10-17T12:00"),
		"Kuota Habis",
	);
	assert.equal(
		promoStatus({ ...promo, enabled: false }, "2026-10-17T12:00"),
		"Nonaktif",
	);
});
test("unique uppercase code, percent limits, integer money and positive quota", () => {
	const good = draft();
	assert.deepEqual(validatePromo(good, PROMOS), {});
	assert.equal(
		buildPromo({ ...good, code: " qa10 " }, PROMOS, "id").code,
		"QA10",
	);
	assert.ok(validatePromo({ ...good, code: " weekend20 " }, PROMOS).code);
	for (const value of [
		"0",
		"101",
		"-1",
		"1e2",
		"1.2",
		"Infinity",
		"9007199254740992",
	])
		assert.ok(validatePromo({ ...good, value }, []).value);
	assert.ok(
		validatePromo(
			{ ...good, minSpend: "-1", maxDiscount: "0", usageLimit: "0" },
			[],
		).minSpend,
	);
	assert.ok(
		validatePromo(
			{ ...good, minSpend: "-1", maxDiscount: "0", usageLimit: "0" },
			[],
		).maxDiscount,
	);
	assert.ok(validatePromo({ ...good, usageLimit: "0" }, []).usageLimit);
});
test("calendar validates impossible dates, reversed periods and WIB New Year", () => {
	const good = draft();
	assert.ok(validatePromo({ ...good, start: "2026-02-30T00:00" }, []).start);
	assert.ok(validatePromo({ ...good, end: good.start }, []).end);
	assert.deepEqual(
		validatePromo(
			{ ...good, start: "2027-01-01T00:00", end: "2027-01-02T00:00" },
			[],
		),
		{},
	);
});
test("edit retains ID/usage, rejects quota below used; transactions are not rewritten", () => {
	const original = PROMOS[0];
	const editing = {
		...promoDraft(original),
		name: "Nama baru",
		usageLimit: "12",
	};
	const result = buildPromo(editing, PROMOS, "wrong-id", original);
	assert.equal(result.id, original.id);
	assert.equal(result.used, 12);
	assert.ok(
		validatePromo({ ...editing, usageLimit: "11" }, PROMOS, original)
			.usageLimit,
	);
	assert.equal(original.name, "Diskon Akhir Pekan");
});
test("preview respects minimum, cap, nonnegative subtotal and no discount above subtotal", () => {
	assert.equal(discountPreview(PROMOS[0], 49000), 0);
	assert.equal(discountPreview(PROMOS[0], 50000), 10000);
	assert.equal(discountPreview(PROMOS[0], 500000), 20000);
	assert.equal(
		discountPreview(
			{ type: "Nominal", value: 100000, minSpend: 0, maxDiscount: null },
			50000,
		),
		50000,
	);
	assert.equal(discountPreview(PROMOS[0], -1), 0);
});
test("versioned storage rejects malformed/corrupt/duplicate data rather than overwriting", () => {
	assert.deepEqual(decodePromos(encodePromos(PROMOS)), PROMOS);
	for (const raw of [
		"{",
		"null",
		"[]",
		JSON.stringify({ version: 2, promos: PROMOS }),
		encodePromos([PROMOS[0], PROMOS[0]]),
		encodePromos([{ ...PROMOS[0], used: -1 }]),
		encodePromos([{ ...PROMOS[0], value: 101 }]),
		JSON.stringify({
			version: 1,
			promos: [{ ...PROMOS[0], usageLimit: null, maxDiscount: undefined }],
		}),
	])
		assert.throws(() => decodePromos(raw));
});
