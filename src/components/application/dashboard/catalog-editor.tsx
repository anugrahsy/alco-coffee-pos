"use client";
import { useState, type ReactNode } from "react";
import { RiCloseLine } from "@remixicon/react";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, SelectItem } from "@/components/base/select/select";
import { Switch } from "@/components/base/switch/switch";
import {
	catalogMoney,
	parseRupiah,
	saveCategory,
	saveProduct,
	type CatalogCategory,
	type CatalogProduct,
	type CatalogState,
} from "@/features/catalog/catalog-demo";

function EditorShell({
	title,
	onClose,
	children,
	footer,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer: ReactNode;
}) {
	return (
		<ResponsiveDrawer
			isOpen
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			label={title}
			side="end"
		>
			<header className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border p-4">
				<h2 className="text-title-3-semibold text-text-primary">{title}</h2>
				<Button
					variant="ghost"
					iconOnly
					leadingIcon={RiCloseLine}
					aria-label="Tutup detail katalog"
					onClick={onClose}
					className="min-h-11 min-w-11"
				/>
			</header>
			<SoftScroll contentClassName="flex flex-col gap-4 p-4">
				{children}
			</SoftScroll>
			<footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-separator-border p-4">
				{footer}
			</footer>
		</ResponsiveDrawer>
	);
}

export type ProductEditorValue = {
	value: CatalogProduct;
	mode: "view" | "edit" | "new";
	revision: number;
};
export function ProductEditor({
	editor,
	state,
	onClose,
	onSaved,
	commit,
	disabled,
}: {
	editor: ProductEditorValue;
	state: CatalogState;
	onClose: () => void;
	onSaved: () => void;
	commit: (state: CatalogState) => void;
	disabled: boolean;
}) {
	const [draft, setDraft] = useState(editor.value);
	const [price, setPrice] = useState(String(draft.price || ""));
	const [cost, setCost] = useState(String(draft.cost));
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const readOnly = editor.mode === "view";
	const changed =
		editor.mode === "new" ||
		JSON.stringify({ ...draft, price: Number(price), cost: Number(cost) }) !==
			JSON.stringify(state.products.find((row) => row.id === draft.id));
	const update = <K extends keyof CatalogProduct>(
		key: K,
		value: CatalogProduct[K],
	) => {
		setDraft((row) => ({ ...row, [key]: value }));
		setError("");
	};
	const save = () => {
		if (pending) return;
		setPending(true);
		try {
			if (state.revision !== editor.revision)
				throw new Error(
					"Katalog sudah diperbarui. Tutup dan buka ulang form agar perubahan tidak tertimpa.",
				);
			commit(
				saveProduct(state, {
					...draft,
					price: parseRupiah(price, true),
					cost: parseRupiah(cost),
				}),
			);
			onSaved();
		} catch (cause) {
			setError((cause as Error).message);
		} finally {
			setPending(false);
		}
	};
	return (
		<EditorShell
			title={
				readOnly
					? "Detail Produk"
					: editor.mode === "new"
						? "Tambah Produk"
						: "Edit Produk"
			}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{readOnly ? "Tutup" : "Batal"}
					</Button>
					{!readOnly && (
						<Button
							variant="primary"
							onClick={save}
							disabled={disabled || pending || !changed}
						>
							Simpan Produk
						</Button>
					)}
				</>
			}
		>
			<p className="text-body-2-regular text-text-secondary">
				Contoh Data · Lokal browser. Perubahan ini belum diterapkan ke katalog
				POS atau Supabase.
			</p>
			<Input
				label="Nama produk"
				value={draft.name}
				onChange={(value) => update("name", value)}
				isReadOnly={readOnly}
				maxLength={100}
				isRequired
			/>
			<Input
				label="Kode produk"
				value={draft.code}
				onChange={(value) => update("code", value)}
				isReadOnly={readOnly}
				maxLength={32}
				isRequired
			/>
			<div className="flex flex-col gap-1">
				<span className="text-body-medium text-text-primary">Kategori</span>
				<Select
					selectedKey={draft.categoryId || null}
					onSelectionChange={(key) => update("categoryId", String(key))}
					isDisabled={readOnly}
					aria-label="Kategori produk"
					placeholder="Pilih kategori aktif"
					className="w-full"
				>
					{state.categories
						.filter((row) => row.active || row.id === editor.value.categoryId)
						.map((row) => (
							<SelectItem
								key={row.id}
								id={row.id}
								textValue={`${row.name}${!row.active ? " (nonaktif)" : ""}`}
							>
								{row.name}
								{!row.active ? " (nonaktif)" : ""}
							</SelectItem>
						))}
				</Select>
			</div>
			<Input
				label="Harga jual (Rp)"
				value={price}
				onChange={setPrice}
				inputMode="numeric"
				isReadOnly={readOnly}
				hint="Rupiah bulat, contoh 30000."
				isRequired
			/>
			<Input
				label="HPP estimasi per porsi (Rp)"
				value={cost}
				onChange={setCost}
				inputMode="numeric"
				isReadOnly={readOnly}
				hint="Minimal 0; bukan pembelian bahan baku."
				isRequired
			/>
			{Number(cost) > Number(price) && (
				<p
					role="status"
					className="rounded-xl bg-status-yellow-background p-3 text-body-2-regular text-status-yellow-text"
				>
					HPP melebihi harga jual. Estimasi margin produk negatif; nilai tetap
					boleh disimpan.
				</p>
			)}
			<Input
				label="URL foto (opsional)"
				value={draft.photo}
				onChange={(value) => update("photo", value)}
				isReadOnly={readOnly}
				hint="HTTPS saja; unggah foto ke Storage belum tersedia."
			/>
			<Switch
				isSelected={draft.active}
				onChange={(value) => update("active", value)}
				isDisabled={readOnly}
			>
				Produk aktif
			</Switch>
			<Switch
				isSelected={draft.available}
				onChange={(value) => update("available", value)}
				isDisabled={readOnly}
			>
				Tersedia (nonaktif = habis)
			</Switch>
			<p className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary">
				Perubahan master tidak mengubah harga/HPP snapshot pesanan lama. Produk
				tidak dihapus permanen; nonaktifkan bila tidak dijual lagi.
			</p>
			{!draft.active && (
				<p className="text-body-2-regular text-text-secondary">
					Produk nonaktif tidak ditawarkan untuk pesanan baru; histori tetap
					dipertahankan.
				</p>
			)}
			{readOnly && (
				<p className="text-body-medium text-text-primary">
					Estimasi margin: {catalogMoney(draft.price - draft.cost)} per porsi
				</p>
			)}
			{error && (
				<p role="alert" className="text-body-2-regular text-text-error-primary">
					{error}
				</p>
			)}
		</EditorShell>
	);
}

export type CategoryEditorValue = {
	value: CatalogCategory;
	mode: "view" | "edit" | "new";
	revision: number;
};
export function CategoryEditor({
	editor,
	state,
	onClose,
	onSaved,
	commit,
	disabled,
}: {
	editor: CategoryEditorValue;
	state: CatalogState;
	onClose: () => void;
	onSaved: () => void;
	commit: (state: CatalogState) => void;
	disabled: boolean;
}) {
	const [draft, setDraft] = useState(editor.value);
	const [order, setOrder] = useState(String(draft.order));
	const [error, setError] = useState("");
	const readOnly = editor.mode === "view";
	const update = <K extends keyof CatalogCategory>(
		key: K,
		value: CatalogCategory[K],
	) => {
		setDraft((row) => ({ ...row, [key]: value }));
		setError("");
	};
	const count = state.products.filter(
		(row) => row.categoryId === draft.id,
	).length;
	const changed =
		editor.mode === "new" ||
		JSON.stringify({ ...draft, order: Number(order) }) !==
			JSON.stringify(state.categories.find((row) => row.id === draft.id));
	const save = () => {
		try {
			if (state.revision !== editor.revision)
				throw new Error(
					"Katalog sudah diperbarui. Tutup dan buka ulang form agar perubahan tidak tertimpa.",
				);
			if (!/^\d+$/.test(order))
				throw new Error("Urutan harus bilangan bulat 0–9999.");
			commit(saveCategory(state, { ...draft, order: Number(order) }));
			onSaved();
		} catch (cause) {
			setError((cause as Error).message);
		}
	};
	return (
		<EditorShell
			title={
				readOnly
					? "Detail Kategori"
					: editor.mode === "new"
						? "Tambah Kategori"
						: "Edit Kategori"
			}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{readOnly ? "Tutup" : "Batal"}
					</Button>
					{!readOnly && (
						<Button
							variant="primary"
							onClick={save}
							disabled={disabled || !changed}
						>
							Simpan Kategori
						</Button>
					)}
				</>
			}
		>
			<p className="text-body-2-regular text-text-secondary">
				Contoh Data · Lokal browser, belum disinkronkan ke Supabase.
			</p>
			<Input
				label="Nama kategori"
				value={draft.name}
				onChange={(value) => update("name", value)}
				isReadOnly={readOnly}
				maxLength={100}
				isRequired
			/>
			<Input
				label="Kode kategori"
				value={draft.code}
				onChange={(value) => update("code", value)}
				isReadOnly={readOnly}
				maxLength={32}
				isRequired
			/>
			<Input
				label="Deskripsi"
				value={draft.description}
				onChange={(value) => update("description", value)}
				isReadOnly={readOnly}
				maxLength={300}
			/>
			<Input
				label="Urutan tampil"
				value={order}
				onChange={setOrder}
				inputMode="numeric"
				isReadOnly={readOnly}
				hint="Bilangan bulat 0–9999, urutan kecil ditampilkan lebih dahulu."
			/>
			<Switch
				isSelected={draft.active}
				onChange={(value) => update("active", value)}
				isDisabled={readOnly}
			>
				Kategori aktif
			</Switch>
			<p className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary">
				{count} produk terkait. Kategori nonaktif tidak bisa dipilih untuk
				produk baru atau perpindahan kategori. Produk lama dan histori tetap
				ada; status produk tidak berubah otomatis.
			</p>
			{error && (
				<p role="alert" className="text-body-2-regular text-text-error-primary">
					{error}
				</p>
			)}
		</EditorShell>
	);
}
