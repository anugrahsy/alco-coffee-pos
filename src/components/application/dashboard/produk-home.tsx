"use client";
import { useState } from "react";
import {
	RiAddLine,
	RiBox3Line,
	RiCheckboxCircleLine,
	RiCloseCircleLine,
	RiPriceTag3Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { useCatalogDemo } from "@/features/catalog/use-catalog-demo";
import { PageHeader } from "./page-header";
import { ProdukTable } from "./produk-table";
import { StatCards, type Stat } from "./stat-cards";
import { ProductEditor, type ProductEditorValue } from "./catalog-editor";

export function ProdukHome() {
	const catalog = useCatalogDemo();
	const { state } = catalog;
	const [editor, setEditor] = useState<ProductEditorValue | null>(null);
	const disabled = !catalog.ready || !catalog.online || !!catalog.error;
	const active = state.products.filter((row) => row.active).length;
	const stats: Stat[] = [
		{
			icon: RiBox3Line,
			label: "Total Produk",
			value: String(state.products.length),
			delta: "—",
			deltaColor: "neutral",
		},
		{
			icon: RiCheckboxCircleLine,
			label: "Aktif",
			value: String(active),
			delta: "—",
			deltaColor: "neutral",
		},
		{
			icon: RiCloseCircleLine,
			label: "Nonaktif",
			value: String(state.products.length - active),
			delta: "—",
			deltaColor: "neutral",
		},
		{
			icon: RiPriceTag3Line,
			label: "Kategori",
			value: String(new Set(state.products.map((row) => row.categoryId)).size),
			delta: "—",
			deltaColor: "neutral",
		},
	];
	const close = () => {
		if (
			editor?.mode === "view" ||
			window.confirm("Tutup form? Perubahan yang belum disimpan akan dibuang.")
		)
			setEditor(null);
	};
	return (
		<div className="flex w-full min-w-0 flex-col gap-4">
			<header className="flex flex-col gap-2">
				<PageHeader current="Produk" icon={RiBox3Line} />
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div className="flex flex-col gap-0.5 px-1">
						<span className="text-title-2-medium text-text-primary">
							Produk
						</span>
						<span className="text-body-medium text-text-secondary">
							Kelola produk dan status jual di POS
						</span>
					</div>
					<Button
						variant="primary"
						size="medium"
						leadingIcon={RiAddLine}
						disabled={disabled}
						onClick={() =>
							setEditor({
								mode: "new",
								revision: state.revision,
								value: {
									id: crypto.randomUUID(),
									name: "",
									code: "",
									categoryId: "",
									price: 0,
									cost: 0,
									active: true,
									available: true,
									photo: "",
								},
							})
						}
					>
						Tambah Produk
					</Button>
				</div>
				<p className="px-1 text-caption-1-regular text-text-tertiary">
					Contoh Data · Lokal browser, belum terhubung Supabase. Angka ringkasan
					mengikuti seluruh katalog, bukan filter.
				</p>
			</header>
			{catalog.ready && <StatCards variant="plain" stats={stats} />}
			{!catalog.online && (
				<p
					role="status"
					className="text-body-2-regular text-text-error-primary"
				>
					Offline · Perubahan katalog sementara dinonaktifkan.
				</p>
			)}
			{catalog.error ? (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-3 text-body-2-regular text-text-error-primary"
				>
					{catalog.error}
					<Button variant="secondary" onClick={catalog.reload}>
						Coba lagi
					</Button>
				</div>
			) : !catalog.ready ? (
				<p role="status" className="text-body-regular text-text-secondary">
					Memuat katalog lokal…
				</p>
			) : (
				<ProdukTable
					state={state}
					disabled={disabled}
					edit={(value, mode) =>
						setEditor({ value, mode, revision: state.revision })
					}
				/>
			)}
			{catalog.message && (
				<p role="status" className="text-body-2-regular text-text-secondary">
					{catalog.message}
				</p>
			)}
			{editor && (
				<ProductEditor
					editor={editor}
					state={state}
					disabled={disabled}
					commit={catalog.commit}
					onClose={close}
					onSaved={() => setEditor(null)}
				/>
			)}
		</div>
	);
}
