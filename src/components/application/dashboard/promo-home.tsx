"use client";
import { useEffect, useRef, useState } from "react";
import {
	RiAddLine,
	RiHistoryLine,
	RiSparklingLine,
	RiTimeLine,
} from "@remixicon/react";
import { TicketIcon } from "@/components/foundations/icons/ticket";
import { Button } from "@/components/base/buttons/button";
import { PageHeader } from "./page-header";
import { PromosTable } from "./promos-table";
import { PromoEditor } from "./promo-editor";
import { StatCards, type Stat } from "./stat-cards";
import {
	decodePromos,
	encodePromos,
	PROMOS,
	PROMO_STORAGE_KEY,
	promoStatus,
	wibNow,
	type Promo,
	type PromoSearch,
} from "@/features/promo/promo-demo";

export function PromoHome({
	search,
	onSearch,
}: {
	search: PromoSearch;
	onSearch: (patch: Partial<PromoSearch>) => void;
}) {
	const [promos, setPromos] = useState<Promo[]>(PROMOS),
		[ready, setReady] = useState(false),
		[online, setOnline] = useState(true),
		[error, setError] = useState(""),
		[notice, setNotice] = useState("");
	const [now, setNow] = useState(wibNow);
	const [editor, setEditor] = useState<{
		mode: "create" | "view" | "edit" | "disable";
		promo?: Promo;
	} | null>(null);
	const stored = useRef<string | null>(null);
	const load = () => {
		try {
			const raw = localStorage.getItem(PROMO_STORAGE_KEY);
			const next = raw === null ? PROMOS : decodePromos(raw);
			stored.current = raw;
			setPromos(next);
			setError("");
			setReady(true);
		} catch {
			setError(
				"Data promo lokal tidak dapat dimuat. Tidak ada data yang ditimpa. Periksa penyimpanan browser lalu coba lagi.",
			);
			setReady(false);
		}
	};
	useEffect(() => {
		load();
		setOnline(navigator.onLine);
		const refresh = () => {
			setNow(wibNow());
			setOnline(navigator.onLine);
		};
		const changed = (event: StorageEvent) => {
			if (event.key === PROMO_STORAGE_KEY || event.key === null) {
				setNotice(
					"Data promo berubah di tab lain. Tutup formulir dan muat ulang data sebelum melanjutkan.",
				);
				setReady(false);
			}
		};
		window.addEventListener("online", refresh);
		window.addEventListener("offline", refresh);
		window.addEventListener("focus", refresh);
		window.addEventListener("storage", changed);
		const timer = window.setInterval(refresh, 30000);
		return () => {
			clearInterval(timer);
			window.removeEventListener("online", refresh);
			window.removeEventListener("offline", refresh);
			window.removeEventListener("focus", refresh);
			window.removeEventListener("storage", changed);
		};
	}, []);
	const readonly = search.readonly;
	const canMutate = !readonly && ready && online && !error;
	const commit = (next: Promo[]) => {
		if (!navigator.onLine || !ready || error)
			throw new Error(
				"Perubahan dinonaktifkan. Periksa koneksi dan muat ulang data.",
			);
		if (next.length > 500)
			throw new Error(
				"Batas demo 500 promo. Integrasi server diperlukan untuk data lebih besar.",
			);
		try {
			if (localStorage.getItem(PROMO_STORAGE_KEY) !== stored.current) {
				setReady(false);
				throw new Error(
					"Data promo telah berubah. Tutup formulir dan muat ulang data.",
				);
			}
			const raw = encodePromos(next);
			localStorage.setItem(PROMO_STORAGE_KEY, raw);
			stored.current = raw;
		} catch (cause) {
			const message =
				(cause as Error).message ===
				"Data promo telah berubah. Tutup formulir dan muat ulang data."
					? (cause as Error).message
					: "Penyimpanan lokal gagal. Data belum disimpan. Periksa izin atau kapasitas browser lalu coba lagi.";
			setError(message);
			throw new Error(message);
		}
		setPromos(next);
		setEditor(null);
		setNotice("Contoh promo disimpan di browser ini. Belum dikirim ke server.");
	};
	const stats: Stat[] = [
		{
			icon: TicketIcon,
			label: "Total Promo",
			value: String(promos.length),
			delta: "Lokal",
			deltaColor: "neutral",
		},
		{
			icon: RiSparklingLine,
			label: "Aktif",
			value: String(
				promos.filter((promo) => promoStatus(promo, now) === "Aktif").length,
			),
			delta: "WIB",
			deltaColor: "neutral",
		},
		{
			icon: RiTimeLine,
			label: "Terjadwal",
			value: String(
				promos.filter((promo) => promoStatus(promo, now) === "Terjadwal")
					.length,
			),
			delta: "WIB",
			deltaColor: "neutral",
		},
		{
			icon: RiHistoryLine,
			label: "Berakhir",
			value: String(
				promos.filter((promo) => promoStatus(promo, now) === "Berakhir").length,
			),
			delta: "WIB",
			deltaColor: "neutral",
		},
	];
	return (
		<div className="flex w-full min-w-0 flex-col gap-4">
			<header className="flex flex-col gap-2">
				<PageHeader current="Promo" icon={TicketIcon} />
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div className="flex flex-col gap-0.5 px-1">
						<h1 className="text-title-2-medium text-text-primary">Promo</h1>
						<span className="text-body-medium text-text-secondary">
							Kelola promo dan diskon toko
						</span>
					</div>
					{!readonly && (
						<Button
							variant="primary"
							size="medium"
							leadingIcon={RiAddLine}
							onClick={() => setEditor({ mode: "create" })}
							disabled={!canMutate}
						>
							Tambah Promo
						</Button>
					)}
				</div>
			</header>
			<p className="px-1 text-body-2-regular text-text-tertiary">
				Contoh Data · demo lokal browser, belum terhubung POS/Supabase · Waktu
				WIB
			</p>
			{!online && (
				<p
					role="alert"
					className="rounded-xl bg-background-secondary-default p-3 text-body-medium text-text-error-primary"
				>
					Offline. Tambah, edit, dan nonaktifkan promo dinonaktifkan.
				</p>
			)}
			{error && (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-3 rounded-xl border border-border-error-default p-3 text-body-medium text-text-error-primary"
				>
					<span>{error}</span>
					<Button
						variant="secondary"
						onClick={() => {
							setEditor(null);
							load();
						}}
					>
						Coba lagi
					</Button>
				</div>
			)}
			{notice && (
				<div
					role="status"
					className="flex flex-wrap items-center gap-3 text-body-2-regular text-text-secondary"
				>
					<span>{notice}</span>
					{!ready && (
						<Button
							variant="secondary"
							onClick={() => {
								setEditor(null);
								setNotice("");
								load();
							}}
						>
							Muat ulang data
						</Button>
					)}
				</div>
			)}
			{!ready && !error && !notice ? (
				<p role="status" className="text-body-medium text-text-secondary">
					Memuat contoh promo…
				</p>
			) : (
				<>
					<StatCards variant="plain" stats={stats} />
					<PromosTable
						promos={promos}
						now={now}
						canMutate={canMutate}
						readonly={readonly}
						search={search}
						onSearch={onSearch}
						onView={(promo) => setEditor({ mode: "view", promo })}
						onEdit={(promo) => setEditor({ mode: "edit", promo })}
						onDisable={(promo) => setEditor({ mode: "disable", promo })}
					/>
				</>
			)}
			{editor && !readonly && (
				<PromoEditor
					key={`${editor.mode}-${editor.promo?.id ?? "new"}`}
					{...editor}
					promos={promos}
					canMutate={canMutate}
					onClose={() => setEditor(null)}
					onSave={(promo) =>
						commit(
							editor.mode === "create"
								? [promo, ...promos]
								: promos.map((current) =>
										current.id === promo.id ? promo : current,
									),
						)
					}
					onDisable={(promo) =>
						commit(
							promos.map((current) =>
								current.id === promo.id
									? { ...current, enabled: false }
									: current,
							),
						)
					}
				/>
			)}
		</div>
	);
}
