"use client";

import {
	RiAddLine,
	RiDeleteBin6Line,
	RiSave3Line,
	RiShoppingBag3Line,
	RiSubtractLine,
	RiWallet3Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import type { PosCartItem } from "./pos-types";
import { Input } from "@/components/base/input/input";
import { quoteDraft, type PosDraft } from "@/features/pos/pos-demo";

interface PosCartProps {
	cart: PosCartItem[];
	onChangeQuantity: (id: string, delta: number) => void;
	onRemove: (id: string) => void;
	draft: PosDraft;
	onDraftChange: (patch: Partial<PosDraft>) => void;
	onNoteChange: (id: string, note: string) => void;
	onSave: () => void;
	onCheckout: () => void;
	onClear: () => void;
	online: boolean;
	error?: string;
	editingNumber?: string;
}

function formatRupiah(value: number) {
	return "Rp" + value.toLocaleString("id-ID");
}

export function PosCart({
	cart,
	onChangeQuantity,
	onRemove,
	draft,
	onDraftChange,
	onNoteChange,
	onSave,
	onCheckout,
	onClear,
	online,
	error,
	editingNumber,
}: PosCartProps) {
	const subtotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	let total = subtotal;
	let discount = 0;
	let quoteError = "";
	if (cart.length) {
		try {
			const quote = quoteDraft(draft);
			total = quote.total;
			discount = quote.discount;
		} catch (cause) {
			quoteError = (cause as Error).message;
		}
	}

	return (
		<div className="flex min-h-0 h-full flex-1 flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-separator-border p-4">
				<div className="min-w-0">
					<h2 className="text-title-3-semibold text-text-primary">Keranjang</h2>
					{editingNumber && (
						<p className="truncate text-caption-1-medium text-text-tertiary">
							Mengubah {editingNumber}
						</p>
					)}
				</div>
				<span className="text-body-2-regular text-text-tertiary">
					{cart.reduce((sum, item) => sum + item.quantity, 0)} item
				</span>
			</div>

			{/* Items */}
			{cart.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-text-tertiary">
					<RiShoppingBag3Line className="size-12" aria-hidden />
					<p className="text-body-regular">Keranjang kosong</p>
					<p className="text-body-2-regular">Tambahkan produk dari katalog</p>
					{editingNumber && (
						<Button variant="secondary" className="min-h-11" onClick={onClear}>
							Tutup Pesanan Aktif
						</Button>
					)}
				</div>
			) : (
				<SoftScroll contentClassName="p-4">
					<div className="flex flex-col gap-3">
						{cart.map((item) => (
							<div
								key={item.id}
								className="rounded-2xl border border-border-button-default bg-background-primary-default p-3"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="text-body-medium text-text-primary">
											{item.name}
										</p>
										<p className="text-body-2-regular text-text-tertiary">
											{formatRupiah(item.price)} × {item.quantity}
										</p>
									</div>
									<span className="text-body-medium tabular-nums text-text-primary">
										{formatRupiah(item.price * item.quantity)}
									</span>
								</div>

								<div className="mt-2 flex items-center gap-2">
									<Button
										variant="secondary"
										size="small"
										iconOnly
										leadingIcon={RiSubtractLine}
										className="min-h-11 min-w-11"
										aria-label={`Kurangi ${item.name}`}
										onClick={() => onChangeQuantity(item.id, -1)}
									/>
									<span className="w-8 text-center text-body-medium tabular-nums text-text-primary">
										{item.quantity}
									</span>
									<Button
										variant="secondary"
										size="small"
										iconOnly
										leadingIcon={RiAddLine}
										className="min-h-11 min-w-11"
										aria-label={`Tambah jumlah ${item.name}`}
										disabled={item.quantity >= 99}
										onClick={() => onChangeQuantity(item.id, 1)}
									/>
									<Button
										variant="ghost"
										size="small"
										iconOnly
										leadingIcon={RiDeleteBin6Line}
										aria-label={`Hapus ${item.name}`}
										className="ms-auto min-h-11 min-w-11 text-text-error-primary"
										onClick={() => onRemove(item.id)}
									/>
								</div>
								<Input
									size="small"
									aria-label={`Catatan ${item.name}`}
									placeholder="Catatan item (opsional)"
									value={item.note ?? ""}
									maxLength={200}
									onChange={(note) => onNoteChange(item.id, note)}
									className="mt-2"
									fieldClassName="min-h-11"
								/>
							</div>
						))}
					</div>
					<div className="mt-4 flex flex-col gap-3">
						<Input
							label="Pelanggan / meja / label pesanan"
							value={draft.label}
							maxLength={80}
							onChange={(label) => onDraftChange({ label })}
							hint="Wajib untuk Simpan Order; opsional untuk bayar langsung."
							fieldClassName="min-h-11"
						/>
						<Input
							label="Catatan pesanan"
							value={draft.notes}
							maxLength={300}
							onChange={(notes) => onDraftChange({ notes })}
							placeholder="Opsional"
							fieldClassName="min-h-11"
						/>
						<Input
							label="Kode promo contoh"
							value={draft.promotionCode}
							maxLength={30}
							onChange={(promotionCode) => onDraftChange({ promotionCode })}
							placeholder="HEMAT10"
							hint={
								quoteError ||
								"HEMAT10: diskon 10%, min. Rp50.000, maks. Rp15.000 (contoh)."
							}
							isInvalid={Boolean(quoteError)}
							fieldClassName="min-h-11"
						/>
						<Button variant="ghost" className="min-h-11" onClick={onClear}>
							{editingNumber ? "Tutup pesanan aktif" : "Kosongkan keranjang"}
						</Button>
					</div>
				</SoftScroll>
			)}

			{/* Summary */}
			{cart.length > 0 && (
				<div className="flex flex-col gap-4 border-t border-separator-border p-4">
					{error && (
						<p
							role="alert"
							className="text-body-2-regular text-text-error-primary"
						>
							{error}
						</p>
					)}
					{!online && (
						<p
							role="status"
							className="text-body-2-regular text-text-secondary"
						>
							Simpan/bayar tidak tersedia saat offline atau penyimpanan lokal
							belum siap.
						</p>
					)}
					<div className="flex flex-col gap-1">
						<div className="flex justify-between text-body-regular text-text-secondary">
							<span>Subtotal</span>
							<span className="tabular-nums">{formatRupiah(subtotal)}</span>
						</div>
						{discount > 0 && (
							<div className="flex justify-between text-body-regular text-text-secondary">
								<span>Diskon contoh</span>
								<span className="tabular-nums">−{formatRupiah(discount)}</span>
							</div>
						)}
						<div className="flex justify-between text-title-3-semibold text-text-primary">
							<span>Total</span>
							<span className="tabular-nums">{formatRupiah(total)}</span>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Button
							className="min-h-11 w-full"
							leadingIcon={RiWallet3Line}
							disabled={!online || Boolean(quoteError)}
							onClick={onCheckout}
						>
							Bayar Sekarang
						</Button>
						<Button
							variant="secondary"
							className="min-h-11 w-full"
							leadingIcon={RiSave3Line}
							disabled={!online || Boolean(quoteError)}
							onClick={onSave}
						>
							Simpan Order
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
