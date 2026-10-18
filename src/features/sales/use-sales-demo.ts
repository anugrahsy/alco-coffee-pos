"use client";

import { useCallback, useEffect, useState } from "react";
import {
	createSalesRefund,
	makeSalesDemoOrders,
	overlaySalesRefunds,
	parseSalesRefunds,
	SALES_REFUNDS_KEY,
	type SalesOrder,
} from "./sales-demo";

/** Local demo repository only. Replace with role-scoped Supabase queries/RPCs. */
export function useSalesDemo() {
	const [orders, setOrders] = useState<SalesOrder[]>([]);
	const [now, setNow] = useState(() => new Date());
	const [state, setState] = useState<"loading" | "ready" | "error">("loading");
	const [error, setError] = useState("");
	const [online, setOnline] = useState(true);
	const refresh = useCallback(() => {
		try {
			const updated = new Date();
			const next = overlaySalesRefunds(
				makeSalesDemoOrders(updated),
				parseSalesRefunds(localStorage.getItem(SALES_REFUNDS_KEY)),
			);
			setOrders(next);
			setNow(updated);
			setError("");
			setState("ready");
		} catch {
			setState("error");
			setError(
				"Data refund contoh lokal tidak dapat dibaca. Data lama tidak ditimpa. Periksa penyimpanan browser lalu coba lagi.",
			);
		}
	}, []);
	useEffect(() => {
		const connection = () => setOnline(navigator.onLine);
		const onStorage = (event: StorageEvent) => {
			if (event.key === SALES_REFUNDS_KEY || event.key === null) refresh();
		};
		const onFocus = () => refresh();
		connection();
		refresh();
		const timer = window.setInterval(refresh, 60000);
		window.addEventListener("online", connection);
		window.addEventListener("offline", connection);
		window.addEventListener("focus", onFocus);
		window.addEventListener("storage", onStorage);
		return () => {
			clearInterval(timer);
			window.removeEventListener("online", connection);
			window.removeEventListener("offline", connection);
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("storage", onStorage);
		};
	}, [refresh]);
	const refund = (id: string, reason: string, confirmed: boolean) => {
		if (!navigator.onLine)
			throw new Error(
				"Offline. Sambungkan kembali sebelum menyimpan refund contoh.",
			);
		if (state !== "ready")
			throw new Error("Penyimpanan contoh belum tersedia.");
		const at = new Date();
		const latest = parseSalesRefunds(localStorage.getItem(SALES_REFUNDS_KEY));
		const current = overlaySalesRefunds(makeSalesDemoOrders(at), latest).find(
			(order) => order.id === id,
		);
		if (!current) throw new Error("Pesanan tidak tersedia. Muat ulang contoh.");
		const next = createSalesRefund(
			current,
			reason,
			confirmed,
			at.toISOString(),
		);
		try {
			localStorage.setItem(
				SALES_REFUNDS_KEY,
				JSON.stringify([...latest, next]),
			);
		} catch {
			throw new Error(
				"Penyimpanan browser gagal/penuh. Refund contoh belum tersimpan; data lama tetap tersedia.",
			);
		}
		refresh();
	};
	return { orders, now, state, error, online, refresh, refund };
}
