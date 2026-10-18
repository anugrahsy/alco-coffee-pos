"use client";

import { useEffect, useMemo, useRef } from "react";
import {
	RiEdit2Line,
	RiEyeLine,
	RiForbidLine,
	RiRefreshLine,
	RiSearchLine,
} from "@remixicon/react";
import { Tickets } from "lucide-react";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import {
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@/components/base/table/table";
import {
	money,
	PROMO_PAGE_SIZE,
	promoStatus,
	type Promo,
	type PromoSearch,
} from "@/features/promo/promo-demo";

const STATUS_CHIP = {
	Aktif: "lime",
	Terjadwal: "yellow",
	Berakhir: "rose",
	Nonaktif: "gray",
	"Kuota Habis": "orange",
} as const;

const TYPE_CHIP = { Persen: "blue", Nominal: "cyan" } as const;

const parseDate = (value: string) => {
	const date = new Date(`${value}:00+07:00`);
	return {
		day: date.getDate(),
		month: date.toLocaleDateString("id-ID", {
			month: "short",
			timeZone: "Asia/Jakarta",
		}),
		year: date.getFullYear(),
	};
};

/** Tanggal tanpa jam, ringkas: "17 Okt 2026". */
export const formatPromoDate = (value: string) => {
	const { day, month, year } = parseDate(value);
	return `${day} ${month} ${year}`;
};

/** Rentang minimalis: "17 – 19 Okt 2026" atau "17 Okt – 19 Okt 2026". */
const formatPromoRange = (start: string, end: string) => {
	const s = parseDate(start);
	const e = parseDate(end);
	if (start.slice(0, 10) === end.slice(0, 10))
		return `${s.day} ${s.month} ${s.year}`;
	if (s.month === e.month && s.year === e.year)
		return `${s.day} – ${e.day} ${s.month} ${s.year}`;
	if (s.year === e.year)
		return `${s.day} ${s.month} – ${e.day} ${e.month} ${s.year}`;
	return `${s.day} ${s.month} ${s.year} – ${e.day} ${e.month} ${e.year}`;
};

export function PromosTable({
	promos,
	now,
	onView,
	onEdit,
	onDisable,
	canMutate,
	readonly = false,
	search,
	onSearch,
}: {
	promos: Promo[];
	now: string;
	onView: (promo: Promo) => void;
	onEdit: (promo: Promo) => void;
	onDisable: (promo: Promo) => void;
	canMutate: boolean;
	readonly?: boolean;
	search: PromoSearch;
	onSearch: (patch: Partial<PromoSearch>) => void;
}) {
	const { page, q: query, status, type } = search;
	const tableRef = useRef<HTMLTableElement>(null);
	useEffect(() => {
		// Empty-state focus can reveal the centered reset button by scrolling
		// horizontally. New results should start with the name/code visible.
		tableRef.current?.parentElement?.scrollTo({ left: 0 });
	}, [query, status, type]);
	const filtered = useMemo(
		() =>
			promos.filter(
				(promo) =>
					`${promo.name} ${promo.code}`
						.toLocaleLowerCase("id-ID")
						.includes(query.trim().toLocaleLowerCase("id-ID")) &&
					(status === "Semua" || promoStatus(promo, now) === status) &&
					(type === "Semua" || promo.type === type),
			),
		[promos, now, query, status, type],
	);
	const pages = Math.max(1, Math.ceil(filtered.length / PROMO_PAGE_SIZE));
	const currentPage = Math.min(page, pages);
	const visible = filtered.slice(
		(currentPage - 1) * PROMO_PAGE_SIZE,
		currentPage * PROMO_PAGE_SIZE,
	);
	const reset = () =>
		onSearch({ q: "", status: "Semua", type: "Semua", page: 1 });
	return (
		<section
			aria-label="Daftar promo"
			className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2"
		>
			<div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
				<div className="flex h-10 flex-col justify-center">
					<span className="text-body-medium text-text-tertiary">
						Total Promo
					</span>
					<span
						className="text-body-medium text-text-primary"
						aria-live="polite"
					>
						{filtered.length} promo
					</span>
				</div>
				<div className="flex w-full max-w-full flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end">
					<Select
						selectedKey={type}
						onSelectionChange={(key) =>
							onSearch({ type: key as typeof type, page: 1 })
						}
						aria-label="Filter jenis promo"
						renderValue={type === "Semua" ? "Semua jenis" : type}
						className="min-w-32 flex-1 sm:w-36 sm:flex-none"
					>
						{(["Semua", "Persen", "Nominal"] as const).map((option) => (
							<SelectItem key={option} id={option}>
								{option === "Semua" ? "Semua jenis" : option}
							</SelectItem>
						))}
					</Select>
					<Select
						selectedKey={status}
						onSelectionChange={(key) =>
							onSearch({ status: key as typeof status, page: 1 })
						}
						aria-label="Filter status promo"
						renderValue={status === "Semua" ? "Semua status" : status}
						className="min-w-36 flex-1 sm:w-40 sm:flex-none"
					>
						{(
							[
								"Semua",
								"Aktif",
								"Terjadwal",
								"Berakhir",
								"Nonaktif",
								"Kuota Habis",
							] as const
						).map((option) => (
							<SelectItem key={option} id={option}>
								{option === "Semua" ? "Semua status" : option}
							</SelectItem>
						))}
					</Select>
					<Button
						variant="secondary"
						size="medium"
						leadingIcon={RiRefreshLine}
						onClick={reset}
					>
						Reset
					</Button>
					<Input
						placeholder="Cari nama atau kode"
						aria-label="Cari promo"
						value={query}
						onChange={(value) => onSearch({ q: value, page: 1 })}
						leadingIcon={RiSearchLine}
						className="w-full min-w-0 sm:w-64"
						fieldClassName="rounded-full bg-background-secondary-default"
						inputClassName="text-body-medium"
					/>
				</div>
			</div>
			<Table ref={tableRef} aria-label="Promo" className="min-w-[1400px]">
				<TableHeader>
					<TableColumn id="name" isRowHeader className="w-56">
						Nama Promo
					</TableColumn>
					<TableColumn id="code" className="w-32">
						Kode
					</TableColumn>
					<TableColumn id="period" className="w-56">
						Periode
					</TableColumn>
					<TableColumn id="discount" className="w-36">
						Potongan
					</TableColumn>
					<TableColumn id="type" className="w-28">
						Jenis
					</TableColumn>
					<TableColumn id="minSpend" className="w-36">
						Min. Belanja
					</TableColumn>
					<TableColumn id="usage" className="w-40">
						Pemakaian / Kuota
					</TableColumn>
					<TableColumn id="status" className="w-36">
						Status
					</TableColumn>
					{!readonly && (
						<TableColumn id="actions" className="w-36 text-end">
							Aksi
						</TableColumn>
					)}
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<div className="flex flex-col items-center gap-3 py-8 text-body-regular text-text-tertiary">
							<span>Tidak ada promo yang sesuai.</span>
							<Button
								variant="secondary"
								size="medium"
								leadingIcon={RiRefreshLine}
								onClick={reset}
							>
								Reset
							</Button>
						</div>
					)}
				>
					{visible.map((promo) => {
						const currentStatus = promoStatus(promo, now);
						return (
							<TableRow key={promo.id} id={promo.id}>
								<TableCell>
									<span className="inline-flex items-center gap-2 whitespace-nowrap text-body-medium text-text-primary">
										<Tickets
											className="size-4 shrink-0 text-foreground-icon-secondary"
										/>
										{promo.name}
									</span>
								</TableCell>
								<TableCell>
									<bdi
										dir="ltr"
										className="whitespace-nowrap text-body-2-medium text-text-secondary"
									>
										{promo.code}
									</bdi>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap text-text-primary">
										{formatPromoRange(promo.start, promo.end)}
									</span>
								</TableCell>
								<TableCell>
									<span className="flex flex-col items-start gap-1">
										<Chip variant="subtle" color="gray">
											{promo.type === "Persen"
												? `${promo.value}%`
												: money(promo.value)}
										</Chip>
										{promo.maxDiscount !== null && (
											<span className="text-caption-1-regular whitespace-nowrap text-text-tertiary">
												Maks. {money(promo.maxDiscount)}
											</span>
										)}
									</span>
								</TableCell>
								<TableCell>
									<Chip variant="bold" color={TYPE_CHIP[promo.type]}>
										{promo.type}
									</Chip>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap text-text-primary tabular-nums">
										{money(promo.minSpend)}
									</span>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap text-text-secondary tabular-nums">
										{promo.used} / {promo.usageLimit ?? "Tanpa batas"}
									</span>
								</TableCell>
								<TableCell>
									<Chip variant="bold" color={STATUS_CHIP[currentStatus]}>
										{currentStatus}
									</Chip>
								</TableCell>
								{!readonly && (
									<TableCell>
										<div className="flex justify-end gap-2.5">
											<IconButton
												icon={RiEyeLine}
												size="small"
												aria-label={`Lihat ${promo.name}`}
												onClick={() => onView(promo)}
											/>
											<IconButton
												icon={RiEdit2Line}
												size="small"
												aria-label={`Edit ${promo.name}`}
												onClick={() => onEdit(promo)}
												disabled={!canMutate}
											/>
											<IconButton
												icon={RiForbidLine}
												size="small"
												aria-label={`Nonaktifkan ${promo.name}`}
												onClick={() => onDisable(promo)}
												disabled={!canMutate || !promo.enabled}
											/>
										</div>
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<div className="mt-3 flex flex-col gap-3 px-3">
				<p className="text-body-2-regular text-text-tertiary">
					{filtered.length
						? `${(currentPage - 1) * PROMO_PAGE_SIZE + 1}–${Math.min(currentPage * PROMO_PAGE_SIZE, filtered.length)}`
						: "0"}{" "}
					dari {filtered.length} promo · WIB
				</p>
				<Pagination
					page={currentPage}
					totalPages={pages}
					onChange={(page) => onSearch({ page })}
					previousLabel="Sebelumnya"
					nextLabel="Berikutnya"
					aria-label="Halaman promo"
				/>
			</div>
		</section>
	);
}
