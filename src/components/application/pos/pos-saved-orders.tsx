"use client";

import { useState } from "react";
import {
	RiAddLine,
	RiArrowRightSLine,
	RiFolder3Line,
	RiSearchLine,
} from "@remixicon/react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import {
	businessDate,
	money,
	PAYMENT_LABELS,
	type PosDemoOrder,
} from "@/features/pos/pos-demo";
import { printDemoReceipt } from "./pos-checkout";

// Keep the existing project-board composition (reference-boardui-design-task.html):
// status columns, rounded ticket cards, status/area chips, avatar and timestamp.
// Only POS content and interactions replace the former task-ticket fixtures.
const COLUMNS = [
	{ status: "unpaid", label: "Belum Dibayar", color: "yellow" },
	{ status: "paid", label: "Lunas", color: "lime" },
	{ status: "cancelled", label: "Dibatalkan", color: "rose" },
	{ status: "refunded", label: "Dikembalikan", color: "orange" },
] as const;

export function PosSavedOrders({
	orders,
	onOpen,
	onNew,
	onCancel,
}: {
	orders: PosDemoOrder[];
	onOpen: (order: PosDemoOrder, pay?: boolean) => void;
	onNew: () => void;
	onCancel: (order: PosDemoOrder) => void;
}) {
	const [query, setQuery] = useState("");
	const [printError, setPrintError] = useState("");
	const filtered = orders.filter((order) =>
		`${order.number} ${order.label} ${order.items.map((item) => item.name).join(" ")}`
			.toLocaleLowerCase("id-ID")
			.includes(query.trim().toLocaleLowerCase("id-ID")),
	);
	const today = businessDate(new Date());
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-4">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="px-1">
					<h1 className="text-title-2-medium text-text-primary">
						Pesanan Tersimpan
					</h1>
					<p className="text-caption-1-medium text-text-tertiary">
						Contoh Data · Lokal browser · Belum dibayar: semua tanggal
					</p>
				</div>
				<Button
					variant="primary"
					size="medium"
					leadingIcon={RiAddLine}
					className="min-h-11"
					onClick={onNew}
				>
					Order Baru
				</Button>
			</header>
			<Input
				aria-label="Cari pesanan tersimpan"
				placeholder="Cari nomor, pelanggan, meja, produk..."
				leadingIcon={RiSearchLine}
				value={query}
				onChange={setQuery}
				className="max-w-md shrink-0"
				fieldClassName="min-h-11"
			/>
			{printError && (
				<p role="alert" className="text-body-2-regular text-text-error-primary">
					{printError}
				</p>
			)}
			<div className="flex min-h-0 flex-1 gap-2 overflow-x-auto pb-1">
				{COLUMNS.map((column) => {
					const matches = filtered.filter(
						(order) => order.status === column.status,
					);
					return (
						<section
							key={column.status}
							aria-label={column.label}
							className="flex min-h-0 w-[300px] shrink-0 flex-col rounded-[20px] bg-background-secondary-default pt-3 sm:flex-1"
						>
							<div className="flex w-full items-center justify-between px-3">
								<span className="flex items-center gap-1.5">
									<span className="whitespace-nowrap text-body-medium text-text-primary">
										{column.label}
									</span>
									<span className="whitespace-nowrap text-body-medium text-text-secondary">
										{matches.length}
									</span>
								</span>
							</div>
							<SoftScroll
								contentClassName="flex flex-col gap-1.5 px-1.5 pb-1.5 pt-2"
								surface="var(--color-background-secondary-default)"
							>
								{matches.length === 0 ? (
									<p className="px-2 py-4 text-body-2-regular text-text-tertiary">
										{query
											? "Tidak ada pesanan yang cocok."
											: column.status === "refunded"
												? "Refund hanya oleh admin setelah backend terhubung."
												: "Belum ada pesanan contoh."}
									</p>
								) : (
									matches.map((order) => (
										<article
											key={order.id}
											className="flex w-full flex-col gap-2 rounded-xl bg-background-primary-default p-3 shadow-xs"
										>
											<div className="flex w-full items-start justify-between gap-3">
												<span className="flex min-w-0 items-center gap-0.5">
													<span className="whitespace-nowrap text-body-2-medium text-text-secondary">
														{order.number}
													</span>
													<RiArrowRightSLine
														className="size-3.5 shrink-0 text-text-tertiary"
														aria-hidden
													/>
													<span className="truncate text-body-2-medium text-text-secondary">
														{order.label || "Langsung"}
													</span>
												</span>
												<Avatar size="sm" color="neutral" initials="D" />
											</div>
											<div className="flex w-full flex-col gap-2">
												<span className="flex flex-wrap items-center gap-1.5">
													<Chip variant="bold" color={column.color}>
														{column.label}
													</Chip>
													<span className="inline-flex max-w-full items-center gap-1 rounded-md border border-separator-border bg-background-primary-default px-1.5 py-0.5">
														<RiFolder3Line
															className="size-3.5 shrink-0 text-foreground-icon-quaternary"
															aria-hidden
														/>
														<span className="truncate text-body-2-medium text-text-secondary">
															{order.label || "Pelanggan langsung"}
														</span>
													</span>
												</span>
												{order.status === "unpaid" &&
													businessDate(order.createdAt) < today && (
														<Chip variant="bold" color="orange">
															Dari hari sebelumnya
														</Chip>
													)}
												<span className="line-clamp-2 text-body-medium text-text-primary">
													{order.items
														.map((item) => `${item.name} × ${item.quantity}`)
														.join(", ")}
												</span>
												<span className="text-body-medium tabular-nums text-text-primary">
													{money(order.total)}
												</span>
												<span className="text-body-2-medium text-text-secondary">
													{new Date(order.createdAt).toLocaleString("id-ID", {
														timeZone: "Asia/Jakarta",
														day: "numeric",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													})}{" "}
													WIB · Kasir Demo
												</span>
												{order.payment && (
													<span className="text-body-2-regular text-text-tertiary">
														{PAYMENT_LABELS[order.payment.method]} · Pembayaran
														contoh
													</span>
												)}
												{order.cancellationReason && (
													<p className="text-body-2-regular text-text-tertiary">
														Alasan: {order.cancellationReason}
													</p>
												)}
											</div>
											<div className="flex flex-wrap gap-2 border-t border-separator-border pt-2">
												{order.status === "unpaid" && (
													<>
														<Button
															variant="secondary"
															size="small"
															className="min-h-11"
															onClick={() => onOpen(order)}
														>
															Buka / Ubah
														</Button>
														<Button
															size="small"
															className="min-h-11"
															onClick={() => onOpen(order, true)}
														>
															Bayar
														</Button>
														<Button
															variant="ghost"
															size="small"
															className="min-h-11 text-text-error-primary"
															onClick={() => onCancel(order)}
														>
															Batalkan
														</Button>
													</>
												)}
												{order.status !== "cancelled" && (
													<Button
														variant="ghost"
														size="small"
														className="min-h-11"
														onClick={() => {
															setPrintError(
																printDemoReceipt(order)
																	? ""
																	: "Izinkan popup untuk mencetak contoh.",
															);
														}}
													>
														{order.status === "unpaid"
															? "Cetak Tagihan"
															: "Cetak Struk"}
													</Button>
												)}
											</div>
										</article>
									))
								)}
							</SoftScroll>
						</section>
					);
				})}
			</div>
		</div>
	);
}
