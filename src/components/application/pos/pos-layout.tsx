"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	RiCloseLine,
	RiMenuLine,
	RiShoppingBag3Line,
	RiSideBarFill,
} from "@remixicon/react";
import { PosSidebar } from "./pos-sidebar";
import { PosProducts } from "./pos-products";
import { PosCart } from "./pos-cart";
import { PosSavedOrders } from "./pos-saved-orders";
import { PosCheckout } from "./pos-checkout";
import type { PosProduct } from "./pos-types";
import { MonitorHome } from "@/components/application/dashboard/monitor-home";
import { PenjualanHome } from "@/components/application/dashboard/penjualan-home";
import { PromoHome } from "@/components/application/dashboard/promo-home";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ResponsiveDrawer } from "@/components/application/layout/responsive-drawer";
import { parseSalesSearch, type SalesSearch } from "@/features/sales/sales-demo";
import { parsePromoSearch, type PromoSearch } from "@/features/promo/promo-demo";
import {
	businessDate,
	cancelDemoOrder,
	checkoutDemoOrder,
	DEMO_STORAGE_KEY,
	EMPTY_DRAFT,
	money,
	parseStoredOrders,
	replaceOrder,
	saveDemoOrder,
	type PaymentMethod,
	type PosDemoOrder,
	type PosDraft,
	type SavedSource,
} from "@/features/pos/pos-demo";

export function PosLayout() {
	const [draft, setDraft] = useState<PosDraft>(EMPTY_DRAFT);
	const [orders, setOrders] = useState<PosDemoOrder[]>([]);
	const [source, setSource] = useState<SavedSource>();
	const [ready, setReady] = useState(false);
	const [online, setOnline] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
	const [cartOpen, setCartOpen] = useState(false);
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [receipt, setReceipt] = useState<PosDemoOrder | null>(null);
	const [confirmation, setConfirmation] = useState<
		{ kind: "clear" } | { kind: "cancel"; order: PosDemoOrder } | null
	>(null);
	const [reason, setReason] = useState("");
	const busy = useRef(false);
	const navigate = useNavigate();
	const { view } = useSearch({ from: "/_protected/pos" });
	const [salesSearch, setSalesSearch] = useState<SalesSearch>(() =>
		parseSalesSearch({}),
	);
	const [promoSearch, setPromoSearch] = useState<PromoSearch>(() => ({
		...parsePromoSearch({}),
		readonly: true,
	}));
	const showSaved = view === "simpan-pesanan";
	const showMonitor = view === "monitor";
	const showPenjualan = view === "penjualan";
	const showPromo = view === "promo";
	const isContentView =
		showMonitor || showPenjualan || showPromo || showSaved;
	const cart = draft.items;

	useEffect(() => {
		const read = () => {
			try {
				setOrders(parseStoredOrders(localStorage.getItem(DEMO_STORAGE_KEY)));
				setReady(true);
			} catch {
				setReady(false);
				setError(
					"Data contoh lokal tidak dapat dibaca. Data lama tidak ditimpa; periksa penyimpanan browser.",
				);
			}
		};
		const sync = (event: StorageEvent) => {
			if (event.key === DEMO_STORAGE_KEY || event.key === null) read();
		};
		const connection = () => setOnline(navigator.onLine);
		read();
		connection();
		window.addEventListener("storage", sync);
		window.addEventListener("online", connection);
		window.addEventListener("offline", connection);
		return () => {
			window.removeEventListener("storage", sync);
			window.removeEventListener("online", connection);
			window.removeEventListener("offline", connection);
		};
	}, []);

	const updateDraft = (patch: Partial<PosDraft>) => {
		setDraft((previous) => ({ ...previous, ...patch }));
		setError("");
		setMessage("");
	};
	const resetDraft = () => {
		setDraft(EMPTY_DRAFT);
		setSource(undefined);
	};
	const commit = (create: (latest: PosDemoOrder[]) => PosDemoOrder) => {
		if (!ready) throw new Error("Penyimpanan contoh lokal belum tersedia.");
		if (!navigator.onLine)
			throw new Error(
				"Offline. Sambungkan kembali sebelum menyimpan atau membayar.",
			);
		// Read before writing to detect observed version changes; localStorage is
		// NOT a transaction/lock across tabs. Production requires Supabase RPC.
		const latest = parseStoredOrders(localStorage.getItem(DEMO_STORAGE_KEY));
		const order = create(latest);
		const next = replaceOrder(latest, order);
		try {
			localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
		} catch {
			throw new Error(
				"Penyimpanan browser gagal/penuh. Pesanan belum disimpan; keranjang tetap tersedia.",
			);
		}
		setOrders(next);
		return order;
	};
	const save = () => {
		if (busy.current) return;
		busy.current = true;
		setError("");
		try {
			const order = commit((latest) =>
				saveDemoOrder(
					latest,
					draft,
					source,
					crypto.randomUUID(),
					new Date().toISOString(),
				),
			);
			resetDraft();
			setCartOpen(false);
			setMessage(
				`${order.number} disimpan sebagai contoh lokal, belum dibayar. Bukan penyimpanan server.`,
			);
			void navigate({ to: "/pos", search: { view: "simpan-pesanan" } });
		} catch (cause) {
			setError((cause as Error).message);
		} finally {
			busy.current = false;
		}
	};
	const checkout = (payment: {
		method: PaymentMethod;
		received: string;
		verified: boolean;
	}) => {
		if (busy.current) return;
		busy.current = true;
		try {
			const order = commit((latest) =>
				checkoutDemoOrder(
					latest,
					draft,
					source,
					payment,
					crypto.randomUUID(),
					new Date().toISOString(),
				),
			);
			setReceipt(order);
			resetDraft();
			setMessage(
				"Simulasi pembayaran tersimpan lokal. Tidak ada transaksi server atau dana sungguhan.",
			);
		} finally {
			busy.current = false;
		}
	};
	const openOrder = (order: PosDemoOrder, pay = false) => {
		if (cart.length && source?.id !== order.id) {
			setError(
				"Keranjang masih berisi pesanan lain. Simpan atau kosongkan keranjang sebelum membuka pesanan ini.",
			);
			return;
		}
		if (source?.id !== order.id) {
			setDraft({
				items: order.items.map((item) => ({ ...item })),
				label: order.label,
				notes: order.notes,
				promotionCode: order.promotionCode,
			});
			setSource({ id: order.id, version: order.version });
		}
		setError("");
		setMessage("");
		void navigate({ to: "/pos", search: {} });
		if (pay) {
			setCartOpen(false);
			setReceipt(null);
			setCheckoutOpen(true);
		} else if (window.matchMedia("(max-width: 1023px)").matches)
			setCartOpen(true);
	};
	const addToCart = (product: PosProduct) => {
		if (product.active === false || product.available === false) return;
		const existing = cart.find(
			(item) =>
				(item.productId ?? item.id) === product.id &&
				item.price === product.price,
		);
		if (existing && existing.quantity >= 99) {
			setError("Maksimal 99 unit per produk.");
			return;
		}
		if (!existing && cart.length >= 30) {
			setError("Maksimal 30 baris produk per pesanan.");
			return;
		}
		updateDraft({
			items: existing
				? cart.map((item) =>
						item === existing ? { ...item, quantity: item.quantity + 1 } : item,
					)
				: [
						...cart,
						{
							id: `${product.id}:${product.price}`,
							productId: product.id,
							name: product.name,
							price: product.price,
							quantity: 1,
						},
					],
		});
	};
	const cartProps = {
		cart,
		draft,
		error,
		onDraftChange: updateDraft,
		online: online && ready,
		editingNumber: source
			? orders.find((order) => order.id === source.id)?.number
			: undefined,
		onChangeQuantity: (id: string, delta: number) =>
			updateDraft({
				items: cart.flatMap((item) => {
					if (item.id !== id) return [item];
					const quantity = Math.min(99, item.quantity + delta);
					return quantity <= 0 ? [] : [{ ...item, quantity }];
				}),
			}),
		onRemove: (id: string) =>
			updateDraft({ items: cart.filter((item) => item.id !== id) }),
		onNoteChange: (id: string, note: string) =>
			updateDraft({
				items: cart.map((item) => (item.id === id ? { ...item, note } : item)),
			}),
		onSave: save,
		onClear: () => {
			setReason("");
			setConfirmation({ kind: "clear" });
		},
		onCheckout: () => {
			setCartOpen(false);
			setReceipt(null);
			setCheckoutOpen(true);
		},
	};
	const today = businessDate(new Date());
	const revenue = orders
		.filter(
			(order) =>
				order.status === "paid" &&
				order.paidAt &&
				businessDate(order.paidAt) === today,
		)
		.reduce((sum, order) => sum + order.total, 0);

	return (
		<div className="flex h-dvh overflow-hidden bg-background-full">
			<div className="hidden h-full shrink-0 lg:block">
				<PosSidebar
					collapsed={sidebarCollapsed}
					onCollapseChange={setSidebarCollapsed}
					selected={view ?? "kasir"}
				/>
			</div>
			<ResponsiveDrawer
				isOpen={menuOpen}
				onOpenChange={setMenuOpen}
				label="Navigasi POS"
			>
				<PosSidebar
					mobile
					fluid
					selected={view ?? "kasir"}
					onClose={() => setMenuOpen(false)}
				/>
			</ResponsiveDrawer>
			<main className="flex min-w-0 flex-1 flex-col">
				{!isContentView && (
					<>
						<div className="flex shrink-0 items-center justify-between gap-3 border-b border-separator-border bg-background-primary-default p-3 lg:hidden">
							<Button
								variant="secondary"
								iconOnly
								leadingIcon={RiMenuLine}
								aria-label="Buka navigasi POS"
								className="min-h-11 min-w-11"
								onClick={() => setMenuOpen(true)}
							/>
							<Button
								variant="secondary"
								leadingIcon={RiShoppingBag3Line}
								className="min-h-11"
								onClick={() => setCartOpen(true)}
							>
								Keranjang ({cart.reduce((sum, item) => sum + item.quantity, 0)})
							</Button>
						</div>
						<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-separator-border bg-background-primary-default px-4 py-3">
							<div className="flex items-center gap-2">
								<Button
									variant="secondary"
									iconOnly
									leadingIcon={RiSideBarFill}
									aria-label={
										sidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"
									}
									className="max-lg:hidden"
									onClick={() => setSidebarCollapsed((value) => !value)}
								/>
								<div className="flex flex-col gap-1">
									<span className="text-body-medium text-text-primary">
										Alco Coffee · Kasir Demo
									</span>
									<span className="text-caption-1-medium text-text-tertiary">
										Contoh Data · Lokal browser · {online ? "Online" : "Offline"} ·
										Belum terhubung Supabase
									</span>
								</div>
							</div>
							<div className="text-end">
								<p className="text-caption-1-medium text-text-tertiary">
									Pendapatan contoh hari ini · {today} WIB
								</p>
								<p className="text-body-medium tabular-nums text-text-primary">
									{money(revenue)}
								</p>
							</div>
						</div>
						{(message || error || !online) && (
							<div
								role={error || !online ? "alert" : "status"}
								className="shrink-0 border-b border-separator-border bg-background-primary-default px-4 py-2 text-body-2-regular text-text-secondary"
							>
								{!online
									? "Offline. Simpan dan bayar dinonaktifkan; keranjang tetap tersedia."
									: error || message}
							</div>
						)}
					</>
				)}

				{showMonitor || showPenjualan || showPromo ? (
					<div className="min-h-0 flex-1 overflow-y-auto p-4">
						{showMonitor ? (
							<MonitorHome />
						) : showPenjualan ? (
							<PenjualanHome
								search={salesSearch}
								onSearch={(patch) =>
									setSalesSearch((previous) => ({
										...previous,
										page: 1,
										...patch,
									}))
								}
								showProductRecap={false}
							/>
						) : (
							<PromoHome
								search={promoSearch}
								onSearch={(patch) =>
									setPromoSearch((previous) => ({
										...previous,
										...patch,
										page: 1,
									}))
								}
							/>
						)}
					</div>
				) : showSaved ? (
					<PosSavedOrders
						orders={orders}
						onOpen={openOrder}
						onNew={() => navigate({ to: "/pos", search: {} })}
						onCancel={(order) => {
							setReason("");
							setError("");
							setConfirmation({ kind: "cancel", order });
						}}
					/>
				) : (
					<PosProducts onAdd={addToCart} />
				)}
			</main>
			{!isContentView && (
				<aside className="hidden w-[420px] shrink-0 flex-col border-s border-separator-border bg-background-primary-default lg:flex">
					<PosCart {...cartProps} />
				</aside>
			)}
			<ResponsiveDrawer
				isOpen={cartOpen}
				onOpenChange={setCartOpen}
				label="Keranjang POS"
				side="end"
			>
				<div className="flex shrink-0 justify-end border-b border-separator-border p-2">
					<Button
						variant="ghost"
						leadingIcon={RiCloseLine}
						aria-label="Tutup keranjang"
						className="min-h-11"
						onClick={() => setCartOpen(false)}
					>
						Tutup
					</Button>
				</div>
				<PosCart {...cartProps} />
			</ResponsiveDrawer>
			{checkoutOpen && (
				<PosCheckout
					draft={draft}
					isOpen
					onClose={() => {
						setCheckoutOpen(false);
						setReceipt(null);
					}}
					onConfirm={checkout}
					receipt={receipt}
					online={online && ready}
				/>
			)}
			<ResponsiveDrawer
				isOpen={Boolean(confirmation)}
				onOpenChange={(open) => {
					if (!open) setConfirmation(null);
				}}
				label="Konfirmasi pesanan"
				side="end"
			>
				<div className="flex flex-col gap-4 p-4">
					<h2 className="text-title-3-semibold text-text-primary">
						{confirmation?.kind === "cancel"
							? "Batalkan pesanan contoh?"
							: "Tutup keranjang aktif?"}
					</h2>
					<p className="text-body-regular text-text-secondary">
						{confirmation?.kind === "cancel"
							? "Pesanan belum dibayar. Pembatalan tidak mencatat pemasukan atau pengembalian dana."
							: "Perubahan keranjang yang belum disimpan akan dibuang. Pesanan yang sudah disimpan lokal tidak dibatalkan."}
					</p>
					{confirmation?.kind === "cancel" && (
						<Input
							label="Alasan pembatalan"
							value={reason}
							onChange={setReason}
							maxLength={300}
							isRequired
							fieldClassName="min-h-11"
						/>
					)}
					{error && (
						<p
							role="alert"
							className="text-body-2-regular text-text-error-primary"
						>
							{error}
						</p>
					)}
					<Button
						className="min-h-11"
						disabled={
							confirmation?.kind === "cancel" &&
							(!reason.trim() || !online || !ready)
						}
						onClick={() => {
							try {
								if (confirmation?.kind === "cancel") {
									const order = confirmation.order;
									commit((latest) =>
										cancelDemoOrder(
											latest,
											{ id: order.id, version: order.version },
											reason,
											new Date().toISOString(),
										),
									);
									if (source?.id === order.id) resetDraft();
									setMessage(`${order.number} dibatalkan di contoh lokal.`);
								} else resetDraft();
								setConfirmation(null);
								setCartOpen(false);
								setError("");
							} catch (cause) {
								setError((cause as Error).message);
							}
						}}
					>
						Ya,{" "}
						{confirmation?.kind === "cancel"
							? "Batalkan Contoh"
							: "Tutup Keranjang"}
					</Button>
					<Button
						variant="secondary"
						className="min-h-11"
						onClick={() => setConfirmation(null)}
					>
						Kembali
					</Button>
				</div>
			</ResponsiveDrawer>
		</div>
	);
}
