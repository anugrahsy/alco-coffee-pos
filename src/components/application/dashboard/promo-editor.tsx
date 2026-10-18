"use client";
import { useState } from "react";
import { RiCloseLine } from "@remixicon/react";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import { Select, SelectItem } from "@/components/base/select/select";
import { Switch } from "@/components/base/switch/switch";
import {
	buildPromo,
	discountPreview,
	emptyPromoDraft,
	money,
	promoDraft,
	promoStatus,
	validatePromo,
	type Promo,
	type PromoDraft,
} from "@/features/promo/promo-demo";

export function PromoEditor({
	promo,
	mode,
	promos,
	canMutate,
	onClose,
	onSave,
	onDisable,
}: {
	promo?: Promo;
	mode: "create" | "edit" | "view" | "disable";
	promos: Promo[];
	canMutate: boolean;
	onClose: () => void;
	onSave: (promo: Promo) => void;
	onDisable: (promo: Promo) => void;
}) {
	const [initial] = useState<PromoDraft>(() =>
		promo ? promoDraft(promo) : emptyPromoDraft(),
	);
	const [draft, setDraft] = useState<PromoDraft>(initial);
	const [submitted, setSubmitted] = useState(false),
		[pending, setPending] = useState(false),
		[failure, setFailure] = useState(""),
		[discarding, setDiscarding] = useState(false);
	const errors = validatePromo(draft, promos, promo);
	const readOnly = mode === "view" || mode === "disable";
	const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
	const close = () => {
		if (pending) return;
		if (!readOnly && dirty) setDiscarding(true);
		else onClose();
	};
	const update = <K extends keyof PromoDraft>(key: K, value: PromoDraft[K]) => {
		setDraft((current) => ({ ...current, [key]: value }));
		setFailure("");
	};
	const input = (
		key: keyof PromoDraft,
		label: string,
		extra: {
			optional?: boolean;
			numeric?: boolean;
			datetime?: boolean;
			hint?: string;
		} = {},
	) => (
		<Input
			label={label}
			value={String(draft[key])}
			onChange={(value) => update(key, value)}
			isReadOnly={readOnly}
			isDisabled={pending}
			isRequired={!extra.optional}
			validationBehavior="aria"
			isInvalid={submitted && !!errors[key]}
			hint={submitted && errors[key] ? errors[key] : extra.hint}
			type={extra.datetime ? "datetime-local" : "text"}
			inputMode={extra.numeric ? "numeric" : undefined}
		/>
	);
	let preview: number | null = null;
	if (!Object.keys(errors).length)
		preview = discountPreview(
			buildPromo(draft, promos, "preview", promo),
			50000,
		);
	const save = () => {
		setSubmitted(true);
		if (!canMutate || pending || Object.keys(errors).length) return;
		setPending(true);
		try {
			onSave(buildPromo(draft, promos, crypto.randomUUID(), promo));
		} catch (error) {
			setFailure((error as Error).message);
		} finally {
			setPending(false);
		}
	};
	return (
		<ResponsiveDrawer
			isOpen
			onOpenChange={(open) => {
				if (!open) close();
			}}
			label={
				mode === "create"
					? "Tambah Promo"
					: mode === "disable"
						? "Nonaktifkan Promo"
						: mode === "view"
							? "Detail Promo"
							: "Edit Promo"
			}
			side="end"
		>
			<header className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border p-4">
				<h2 className="text-title-3-semibold text-text-primary">
					{mode === "create"
						? "Tambah Promo"
						: mode === "disable"
							? "Nonaktifkan Promo"
							: mode === "view"
								? "Detail Promo"
								: "Edit Promo"}
				</h2>
				<IconButton
					icon={RiCloseLine}
					aria-label="Tutup promo"
					onClick={close}
				/>
			</header>
			<SoftScroll contentClassName="flex flex-col gap-4 p-4">
				<p className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary">
					Contoh Data · hanya tersimpan di browser ini, belum terhubung POS atau
					Supabase. Satu promo per order; kuota diperiksa saat pembayaran, bukan
					saat menyimpan order. Refund tidak mengembalikan kuota.
				</p>
				{discarding ? (
					<div role="alert" className="flex flex-col gap-3">
						<p className="text-body-medium text-text-primary">
							Buang perubahan yang belum disimpan?
						</p>
						<div className="flex flex-wrap gap-2">
							<Button variant="secondary" onClick={() => setDiscarding(false)}>
								Lanjut edit
							</Button>
							<Button variant="danger" onClick={onClose}>
								Buang perubahan
							</Button>
						</div>
					</div>
				) : (
					<>
						{promo && (
							<p className="text-body-medium text-text-secondary">
								{promoStatus(promo)} · Dipakai {promo.used} kali
							</p>
						)}
						{mode === "disable" ? (
							<div className="flex flex-col gap-3 text-body-regular text-text-primary">
								<p>
									Nonaktifkan <strong>{promo?.name}</strong> ({promo?.code})?
								</p>
								<p>
									Promo tidak lagi dapat digunakan. Riwayat pemakaian dan
									transaksi lunas tetap dipertahankan; tidak ada data yang
									dihapus.
								</p>
							</div>
						) : (
							<>
								{input("name", "Nama promo")}
								{input("code", "Kode promo", {
									hint: "Kode unik 3–30 karakter; otomatis menjadi huruf kapital.",
								})}
								<div className="flex flex-col gap-1">
									<span className="text-body-medium text-text-primary">
										Jenis diskon
									</span>
									<Select
										aria-label="Jenis diskon"
										selectedKey={draft.type}
										onSelectionChange={(key) => {
											update("type", key as PromoDraft["type"]);
											if (key === "Nominal") update("maxDiscount", "");
										}}
										isDisabled={readOnly || pending}
									>
										<SelectItem id="Persen">Persen (%)</SelectItem>
										<SelectItem id="Nominal">Nominal (Rp)</SelectItem>
									</Select>
								</div>
								{input(
									"value",
									draft.type === "Persen"
										? "Persentase diskon"
										: "Nominal diskon (Rp)",
									{ numeric: true },
								)}
								{input("minSpend", "Minimal belanja (Rp)", { numeric: true })}
								{draft.type === "Persen" &&
									input("maxDiscount", "Batas diskon (Rp)", {
										numeric: true,
										optional: true,
										hint: "Kosongkan jika tanpa batas diskon.",
									})}
								{input("start", "Mulai (WIB)", { datetime: true })}
								{input("end", "Berakhir (WIB)", { datetime: true })}
								{input("usageLimit", "Batas pemakaian", {
									numeric: true,
									optional: true,
									hint: "Kosongkan jika tanpa batas; tidak boleh kurang dari pemakaian.",
								})}
								<Switch
									isSelected={draft.enabled}
									onChange={(value) => update("enabled", value)}
									isDisabled={readOnly || pending}
								>
									Promo diaktifkan
								</Switch>
								<div className="rounded-xl border border-border-button-default p-3 text-body-2-regular text-text-secondary">
									<p className="text-body-medium text-text-primary">
										Simulasi subtotal {money(50000)}
									</p>
									<p>
										{preview === null
											? "Lengkapi data untuk melihat simulasi diskon."
											: `Diskon ${money(preview)} · Total ${money(50000 - preview)}`}
									</p>
									<p>
										Diskon tidak melebihi subtotal. Simulasi nilai saja; periode
										dan kuota tetap diperiksa saat pembayaran.
									</p>
								</div>
								<p className="text-body-2-regular text-text-tertiary">
									Perubahan promo tidak mengubah transaksi yang telah lunas.
									Promo berlaku untuk semua produk; tanpa kategori/member/ongkir
									khusus.
								</p>
							</>
						)}
						{submitted && Object.keys(errors).length > 0 && !readOnly && (
							<p
								role="alert"
								className="text-body-2-medium text-text-error-primary"
							>
								Periksa kolom yang ditandai sebelum menyimpan.
							</p>
						)}
						{failure && (
							<p
								role="alert"
								className="text-body-2-medium text-text-error-primary"
							>
								{failure}
							</p>
						)}
						{!canMutate && (
							<p
								role="alert"
								className="text-body-2-medium text-text-error-primary"
							>
								Perubahan dinonaktifkan. Periksa koneksi dan penyimpanan lokal.
							</p>
						)}
					</>
				)}
			</SoftScroll>
			{!discarding && (
				<footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-separator-border p-4">
					<Button variant="secondary" onClick={close} disabled={pending}>
						{readOnly ? "Tutup" : "Batal"}
					</Button>
					{!readOnly && (
						<Button
							onClick={save}
							disabled={!canMutate || pending || (mode === "edit" && !dirty)}
						>
							{pending ? "Menyimpan…" : "Simpan contoh lokal"}
						</Button>
					)}
					{mode === "disable" && promo && (
						<Button
							variant="danger"
							onClick={() => {
								try {
									onDisable(promo);
								} catch (error) {
									setFailure((error as Error).message);
								}
							}}
							disabled={!canMutate}
						>
							Nonaktifkan contoh
						</Button>
					)}
				</footer>
			)}
		</ResponsiveDrawer>
	);
}
