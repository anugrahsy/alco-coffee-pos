"use client";

import { useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { RiCloseLine, RiPrinterLine, RiRefund2Line } from "@remixicon/react";
import { useDirection } from "@/components/foundations/direction/direction";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import { Button } from "@/components/base/buttons/button";
import { Chip } from "@/components/base/badges/chip";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import {
	itemTotal,
	orderUnits,
	PAYMENT_LABELS,
	STATUS_LABELS,
	salesMoney,
	salesDate,
	salesTime,
	type SalesOrder,
} from "@/features/sales/sales-demo";

export function printSalesReceipt(order: SalesOrder) {
	const popup = window.open("", "_blank", "width=440,height=720");
	if (!popup) return false;
	popup.document.title = `Struk contoh ${order.number}`;
	const pre = popup.document.createElement("pre");
	pre.style.cssText =
		"white-space:pre-wrap;font:13px/1.6 monospace;max-width:76mm;margin:20px auto";
	pre.textContent = [
		"ALCO COFFEE · CONTOH DATA",
		"BUKAN BUKTI PEMBAYARAN",
		"",
		order.status === "unpaid"
			? "TAGIHAN — BELUM DIBAYAR"
			: STATUS_LABELS[order.status].toUpperCase(),
		order.number,
		`${salesDate(order.paidAt ?? order.createdAt)} ${salesTime(order.paidAt ?? order.createdAt)} WIB`,
		`Kasir: ${order.cashier} · ${order.label}`,
		"",
		...order.items.flatMap((item) => [
			`${item.name} × ${item.quantity}`,
			`${salesMoney(item.unitPrice)}  ·  ${salesMoney(itemTotal(item))}`,
			...(item.discount ? [`Diskon item: ${salesMoney(item.discount)}`] : []),
		]),
		"",
		`Subtotal: ${salesMoney(order.subtotal)}`,
		`Diskon: ${salesMoney(order.discount)}`,
		`TOTAL ASLI: ${salesMoney(order.total)}`,
		order.method ? PAYMENT_LABELS[order.method] : "Belum dibayar",
		...(order.refund
			? [
					"",
					`DIKEMBALIKAN: ${salesMoney(order.refund.amount)}`,
					`${salesDate(order.refund.at)} ${salesTime(order.refund.at)} WIB`,
					`Alasan: ${order.refund.reason}`,
				]
			: []),
		order.notes,
		"",
		"Simulasi UI, bukan transaksi server.",
	].join("\n");
	popup.document.body.append(pre);
	popup.focus();
	popup.print();
	return true;
}

export function SalesOrderModal({
	order,
	onClose,
	onRefund,
	online,
}: {
	order: SalesOrder;
	onClose: () => void;
	online: boolean;
	onRefund: (reason: string, confirmed: boolean) => void;
}) {
	const [refunding, setRefunding] = useState(false);
	const [reason, setReason] = useState("");
	const [confirmed, setConfirmed] = useState(false);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const paid = order.paidAt;
	const direction = useDirection();
	return (
		<ModalOverlay
			isOpen
			isDismissable={!pending}
			dir={direction}
			className="fixed inset-0 z-50 flex items-center justify-center bg-background-secondary-default/80 p-3 sm:p-6"
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
		>
			<Modal className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-clip rounded-3xl border border-border-button-default bg-background-primary-default shadow-dropdown sm:max-h-[calc(100dvh-3rem)]">
				<Dialog
					aria-label={`Detail ${order.number}`}
					dir={direction}
					className="flex min-h-0 flex-1 flex-col outline-none"
				>
					<header className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border p-4">
						<div className="flex min-w-0 flex-col gap-1">
							<h2 className="text-title-3-semibold text-text-primary">
								Detail Pesanan
							</h2>
							<span className="text-body-2-regular text-text-secondary">
								{order.number}
							</span>
						</div>
						<Button
							variant="ghost"
							iconOnly
							leadingIcon={RiCloseLine}
							aria-label="Tutup detail pesanan"
							className="min-h-11 min-w-11"
							onClick={onClose}
							disabled={pending}
						/>
					</header>
					<SoftScroll contentClassName="flex flex-col gap-5 p-4">
						<p className="rounded-xl bg-background-secondary-default p-3 text-body-2-regular text-text-secondary">
							Contoh Data · bukan transaksi toko.
						</p>
						<div className="flex items-center justify-between gap-3">
							<span className="text-body-medium text-text-primary">
								{order.label}
							</span>
							<Chip
								variant="bold"
								color={
									order.status === "paid"
										? "lime"
										: order.status === "refunded"
											? "rose"
											: "yellow"
								}
							>
								{STATUS_LABELS[order.status]}
							</Chip>
						</div>
						<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-body-2-regular">
							<dt className="text-text-tertiary">Dibuat</dt>
							<dd className="text-end text-text-primary">
								{salesDate(order.createdAt)} · {salesTime(order.createdAt)} WIB
							</dd>
							<dt className="text-text-tertiary">Dibayar</dt>
							<dd className="text-end text-text-primary">
								{paid
									? `${salesDate(paid)} · ${salesTime(paid)} WIB`
									: "Belum dibayar"}
							</dd>
							<dt className="text-text-tertiary">Kasir penerima</dt>
							<dd className="text-end text-text-primary">
								{paid ? order.cashier : "—"}
							</dd>
							<dt className="text-text-tertiary">Kasir pembuat</dt>
							<dd className="text-end text-text-primary">{order.cashier}</dd>
							<dt className="text-text-tertiary">Metode</dt>
							<dd className="text-end text-text-primary">
								{order.method ? PAYMENT_LABELS[order.method] : "—"}
							</dd>
							<dt className="text-text-tertiary">Jenis</dt>
							<dd className="text-end text-text-primary">{order.orderType}</dd>
						</dl>
						<section aria-label="Item pesanan" className="flex flex-col gap-3">
							<h3 className="text-body-medium text-text-primary">
								{orderUnits(order)} unit · {order.items.length} produk
							</h3>
							{order.items.map((item, index) => (
								<div
									key={`${item.productId}-${index}`}
									className="flex items-start justify-between gap-3 rounded-xl bg-background-secondary-default p-3"
								>
									<div className="flex min-w-0 flex-col gap-1">
										<span className="text-body-medium text-text-primary">
											{item.name}
										</span>
										<span className="text-body-2-regular text-text-secondary">
											{item.quantity} × {salesMoney(item.unitPrice)}
											{item.discount > 0 &&
												` · Diskon ${salesMoney(item.discount)}`}
										</span>
									</div>
									<span className="shrink-0 text-body-medium tabular-nums text-text-primary">
										{salesMoney(itemTotal(item))}
									</span>
								</div>
							))}
						</section>
						<dl className="grid grid-cols-2 gap-2 border-t border-separator-border pt-4 text-body-regular text-text-secondary">
							<dt>Subtotal</dt>
							<dd className="text-end tabular-nums">
								{salesMoney(order.subtotal)}
							</dd>
							<dt>Diskon</dt>
							<dd className="text-end tabular-nums">
								{salesMoney(order.discount)}
							</dd>
							<dt className="text-body-medium text-text-primary">Total asli</dt>
							<dd className="text-end text-body-medium tabular-nums text-text-primary">
								{salesMoney(order.total)}
							</dd>
						</dl>
						{order.notes && (
							<p className="text-body-2-regular text-text-secondary">
								Catatan: {order.notes}
							</p>
						)}
						{order.refund && (
							<section
								aria-label="Rincian refund"
								className="flex flex-col gap-2 rounded-xl bg-background-secondary-default p-3"
							>
								<h3 className="text-body-medium text-text-primary">
									Dikembalikan penuh · {salesMoney(order.refund.amount)}
								</h3>
								<p className="text-body-2-regular text-text-secondary">
									{salesDate(order.refund.at)} · {salesTime(order.refund.at)}{" "}
									WIB · {order.refund.actor}
								</p>
								<p className="break-words text-body-2-regular text-text-secondary">
									{order.refund.reason}
								</p>
								<p className="text-body-2-regular text-text-tertiary">
									Mengurangi laporan pada tanggal refund; pembayaran asal tetap
									tercatat pada tanggal bayar.
								</p>
							</section>
						)}
						{refunding && order.status === "paid" && (
							<section
								aria-label="Konfirmasi refund contoh"
								className="flex flex-col gap-3 rounded-xl border border-border-error-default p-3"
							>
								<h3 className="text-body-medium text-text-primary">
									Refund penuh contoh?
								</h3>
								<p className="text-body-2-regular text-text-secondary">
									{salesMoney(order.total)} melalui{" "}
									{order.method && PAYMENT_LABELS[order.method]}. Tidak dapat
									direfund dua kali. Hanya simulasi peran Admin, bukan otorisasi
									produksi.
								</p>
								<Input
									label="Alasan refund"
									value={reason}
									onChange={setReason}
									maxLength={300}
									isRequired
									fieldClassName="min-h-11"
								/>
								<Checkbox isSelected={confirmed} onChange={setConfirmed}>
									Dana sudah dikembalikan melalui metode asal (simulasi)
								</Checkbox>
								<div className="flex flex-wrap gap-2">
									<Button
										variant="secondary"
										className="min-h-11"
										onClick={() => setRefunding(false)}
										disabled={pending}
									>
										Batal
									</Button>
									<Button
										variant="danger"
										className="min-h-11"
										disabled={
											!reason.trim() || !confirmed || !online || pending
										}
										onClick={() => {
											if (pending) return;
											setPending(true);
											setError("");
											try {
												onRefund(reason, confirmed);
												setRefunding(false);
											} catch (cause) {
												setError((cause as Error).message);
											} finally {
												setPending(false);
											}
										}}
									>
										Konfirmasi refund contoh
									</Button>
								</div>
							</section>
						)}
						{error && (
							<p
								role="alert"
								className="text-body-2-regular text-text-error-primary"
							>
								{error}
							</p>
						)}
					</SoftScroll>
					<footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-separator-border p-4">
						{order.status === "paid" && !refunding && (
							<Button
								variant="danger"
								leadingIcon={RiRefund2Line}
								className="min-h-11"
								disabled={!online || pending}
								onClick={() => setRefunding(true)}
							>
								Refund contoh
							</Button>
						)}
						{order.status !== "cancelled" && (
							<Button
								variant="secondary"
								leadingIcon={RiPrinterLine}
								className="min-h-11"
								onClick={() => {
									if (!printSalesReceipt(order))
										setError(
											"Popup cetak diblokir. Izinkan popup lalu coba lagi.",
										);
								}}
							>
								Cetak
							</Button>
						)}
					</footer>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
