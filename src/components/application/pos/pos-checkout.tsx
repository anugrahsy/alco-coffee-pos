"use client";

import { useState } from "react";
import { RiCloseLine, RiPrinterLine } from "@remixicon/react";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import {
	money,
	PAYMENT_LABELS,
	quoteDraft,
	type PaymentMethod,
	type PosDemoOrder,
	type PosDraft,
} from "@/features/pos/pos-demo";

export function printDemoReceipt(order: PosDemoOrder) {
	const popup = window.open("", "_blank", "width=420,height=720");
	if (!popup) return false;
	popup.document.title = `Struk contoh ${order.number}`;
	const receipt = popup.document.createElement("pre");
	receipt.style.cssText =
		"white-space:pre-wrap;font:13px/1.6 monospace;max-width:76mm;margin:20px auto";
	receipt.textContent = [
		"ALCO COFFEE",
		"CONTOH DATA · LOKAL BROWSER",
		"BUKAN BUKTI PEMBAYARAN",
		"",
		order.status === "paid" ? "STRUK DEMO" : "TAGIHAN — BELUM DIBAYAR",
		order.number,
		new Date(order.paidAt ?? order.createdAt).toLocaleString("id-ID", {
			timeZone: "Asia/Jakarta",
		}) + " WIB",
		"Kasir: Demo",
		order.label,
		"",
		...order.items.flatMap((item) => [
			`${item.name} × ${item.quantity}`,
			`${money(item.price)}                 ${money(item.price * item.quantity)}`,
			...(item.note ? [`Catatan: ${item.note}`] : []),
		]),
		"",
		`Subtotal: ${money(order.subtotal)}`,
		`Diskon: ${money(order.discount)}`,
		`TOTAL: ${money(order.total)}`,
		...(order.payment
			? [
					PAYMENT_LABELS[order.payment.method],
					`Diterima: ${money(order.payment.received)}`,
					`Kembalian: ${money(order.payment.change)}`,
				]
			: []),
		order.notes ? `Catatan: ${order.notes}` : "",
		"",
		"Simulasi antarmuka; tidak dikirim ke server.",
	].join("\n");
	popup.document.body.append(receipt);
	popup.focus();
	popup.print();
	return true;
}

export function PosCheckout({
	draft,
	isOpen,
	onClose,
	onConfirm,
	receipt,
	online,
}: {
	draft: PosDraft;
	isOpen: boolean;
	onClose: () => void;
	online: boolean;
	onConfirm: (payment: {
		method: PaymentMethod;
		received: string;
		verified: boolean;
	}) => void;
	receipt: PosDemoOrder | null;
}) {
	const [method, setMethod] = useState<PaymentMethod>("cash");
	const [received, setReceived] = useState("");
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	let total = 0;
	let quoteError = "";
	if (draft.items.length) {
		try {
			total = quoteDraft(draft).total;
		} catch (cause) {
			quoteError = (cause as Error).message;
		}
	}
	const enoughCash =
		/^\d+$/.test(received) &&
		Number.isSafeInteger(Number(received)) &&
		Number(received) >= total;
	const canConfirm =
		online &&
		!pending &&
		!quoteError &&
		draft.items.length > 0 &&
		(method === "cash" ? enoughCash : verified);
	return (
		<ResponsiveDrawer
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
			label={receipt ? "Struk pembayaran contoh" : "Pembayaran contoh"}
			side="end"
		>
			<header className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border p-4">
				<h2 className="text-title-3-semibold text-text-primary">
					{receipt ? "Simulasi selesai" : "Pembayaran"}
				</h2>
				<Button
					variant="ghost"
					iconOnly
					leadingIcon={RiCloseLine}
					aria-label="Tutup pembayaran"
					className="min-h-11 min-w-11"
					onClick={onClose}
					disabled={pending}
				/>
			</header>
			<SoftScroll contentClassName="flex flex-col gap-5 p-4">
				<p className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary">
					Contoh Data · Lokal browser. Tidak ada pembayaran atau pesanan yang
					dikirim ke server.
				</p>
				{receipt ? (
					<>
						<div className="flex flex-col gap-1">
							<span className="text-body-medium text-text-primary">
								{receipt.number}
							</span>
							<span className="text-body-2-regular text-text-tertiary">
								{receipt.label || "Pelanggan langsung"} · Kasir Demo
							</span>
						</div>
						<div className="flex flex-col gap-3">
							{receipt.items.map((item) => (
								<div
									key={item.id}
									className="flex justify-between gap-3 text-body-regular text-text-secondary"
								>
									<span>
										{item.name} × {item.quantity}
									</span>
									<span className="shrink-0 tabular-nums">
										{money(item.price * item.quantity)}
									</span>
								</div>
							))}
						</div>
						<div className="flex flex-col gap-2 border-t border-separator-border pt-4 text-body-regular text-text-secondary">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>{money(receipt.subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span>Diskon</span>
								<span>{money(receipt.discount)}</span>
							</div>
							<div className="flex justify-between text-title-3-semibold text-text-primary">
								<span>Total contoh</span>
								<span>{money(receipt.total)}</span>
							</div>
							<div className="flex justify-between">
								<span>Metode</span>
								<span>
									{receipt.payment && PAYMENT_LABELS[receipt.payment.method]}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Kembalian</span>
								<span>{money(receipt.payment?.change ?? 0)}</span>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex flex-col gap-2">
							<span className="text-body-regular text-text-secondary">
								Total tagihan contoh
							</span>
							<span className="text-title-1-medium tabular-nums text-text-primary">
								{money(total)}
							</span>
							<span className="text-body-2-regular text-text-tertiary">
								{draft.label || "Pelanggan langsung"} ·{" "}
								{draft.items.reduce((sum, item) => sum + item.quantity, 0)} item
							</span>
						</div>
						<div
							className="flex flex-wrap gap-2"
							role="group"
							aria-label="Metode pembayaran"
						>
							{(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((key) => (
								<Button
									key={key}
									variant={method === key ? "primary" : "secondary"}
									className="min-h-11"
									aria-pressed={method === key}
									onClick={() => {
										setMethod(key);
										setVerified(false);
										setError("");
									}}
								>
									{PAYMENT_LABELS[key]}
								</Button>
							))}
						</div>
						{method === "cash" ? (
							<>
								<Input
									label="Uang diterima (Rp)"
									value={received}
									onChange={setReceived}
									inputMode="numeric"
									fieldClassName="min-h-11"
									placeholder="Contoh: 50000"
									isInvalid={received.length > 0 && !enoughCash}
									hint={
										received && !enoughCash
											? "Masukkan rupiah bulat yang mencukupi tagihan."
											: "Tanpa titik atau koma."
									}
								/>
								<div className="flex flex-wrap gap-2">
									{[
										...new Set(
											[total, 50000, 100000].filter(
												(amount) => amount >= total,
											),
										),
									].map((amount) => (
										<Button
											key={amount}
											variant="secondary"
											className="min-h-11"
											onClick={() => setReceived(String(amount))}
										>
											{amount === total ? "Uang pas" : money(amount)}
										</Button>
									))}
								</div>
								<div className="flex justify-between text-body-medium text-text-primary">
									<span>Kembalian</span>
									<span className="tabular-nums">
										{money(enoughCash ? Number(received) - total : 0)}
									</span>
								</div>
							</>
						) : (
							<>
								<p className="text-body-regular text-text-secondary">
									Pastikan dana telah diterima. {PAYMENT_LABELS[method]} tidak
									diverifikasi otomatis dan tidak menampilkan QR/rekening contoh
									untuk transfer sungguhan.
								</p>
								<Checkbox
									isSelected={verified}
									onChange={setVerified}
									className="min-h-11"
								>
									Saya sudah memeriksa dana diterima (simulasi)
								</Checkbox>
							</>
						)}
					</>
				)}
				{(error || quoteError || !online) && (
					<p
						role="alert"
						className="text-body-2-regular text-text-error-primary"
					>
						{!online
							? "Offline. Sambungkan kembali sebelum menyimpan atau membayar."
							: error || quoteError}
					</p>
				)}
			</SoftScroll>
			<footer className="flex shrink-0 flex-col gap-2 border-t border-separator-border p-4">
				{receipt ? (
					<>
						<Button
							variant="secondary"
							leadingIcon={RiPrinterLine}
							className="min-h-11"
							onClick={() => {
								if (!printDemoReceipt(receipt))
									setError("Izinkan popup untuk mencetak struk contoh.");
							}}
						>
							Cetak Struk Contoh
						</Button>
						<Button className="min-h-11" onClick={onClose}>
							Order Baru
						</Button>
					</>
				) : (
					<Button
						className="min-h-11"
						disabled={!canConfirm}
						onClick={() => {
							if (pending) return;
							setPending(true);
							setError("");
							try {
								onConfirm({ method, received, verified });
							} catch (cause) {
								setError((cause as Error).message);
							} finally {
								setPending(false);
							}
						}}
					>
						Konfirmasi Pembayaran Contoh
					</Button>
				)}
			</footer>
		</ResponsiveDrawer>
	);
}
