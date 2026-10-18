"use client";
import { useEffect, useState } from "react";
import {
	CATALOG_EVENT,
	CATALOG_KEY,
	createCatalog,
	decodeCatalog,
	type CatalogState,
} from "./catalog-demo";

export function useCatalogDemo() {
	const [state, setState] = useState<CatalogState>(createCatalog);
	const [ready, setReady] = useState(false);
	const [online, setOnline] = useState(true);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const load = () => {
		try {
			const raw = localStorage.getItem(CATALOG_KEY);
			setState(raw === null ? createCatalog() : decodeCatalog(raw));
			setError("");
			setReady(true);
		} catch {
			setError(
				"Katalog lokal gagal dimuat. Data tidak ditimpa. Periksa penyimpanan browser lalu coba lagi.",
			);
			setReady(false);
		}
	};
	useEffect(() => {
		load();
		const connection = () => setOnline(navigator.onLine);
		const storage = (event: StorageEvent) => {
			if (event.key === CATALOG_KEY || event.key === null) load();
		};
		connection();
		window.addEventListener("online", connection);
		window.addEventListener("offline", connection);
		window.addEventListener("storage", storage);
		window.addEventListener(CATALOG_EVENT, load);
		return () => {
			window.removeEventListener("online", connection);
			window.removeEventListener("offline", connection);
			window.removeEventListener("storage", storage);
			window.removeEventListener(CATALOG_EVENT, load);
		};
	}, []);
	const commit = (next: CatalogState) => {
		if (!ready || error)
			throw new Error("Muat ulang katalog lokal sebelum menyimpan.");
		if (!online)
			throw new Error("Sedang offline. Sambungkan internet sebelum menyimpan.");
		const raw = localStorage.getItem(CATALOG_KEY);
		const latest = raw === null ? createCatalog() : decodeCatalog(raw);
		if (latest.revision !== state.revision) {
			load();
			throw new Error(
				"Katalog sudah diperbarui di tab lain. Muat ulang form sebelum menyimpan.",
			);
		}
		decodeCatalog(JSON.stringify(next));
		try {
			localStorage.setItem(CATALOG_KEY, JSON.stringify(next));
		} catch {
			throw new Error(
				"Penyimpanan browser gagal. Perubahan belum disimpan; form tetap tersedia.",
			);
		}
		setState(next);
		setMessage("Perubahan contoh tersimpan di browser ini, bukan di server.");
		window.dispatchEvent(new Event(CATALOG_EVENT));
	};
	return {
		state,
		commit,
		ready,
		online,
		error,
		message,
		reload: load,
		clearMessage: () => setMessage(""),
	};
}
