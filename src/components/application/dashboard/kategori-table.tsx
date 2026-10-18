"use client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { CatalogSearch } from "@/features/catalog/catalog-search";
import {
	RiEdit2Line,
	RiEyeLine,
	RiFolder3Line,
	RiForbidLine,
	RiRefreshLine,
	RiSearchLine,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import { Switch } from "@/components/base/switch/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@/components/base/table/table";
import {
	catalogPage,
	type CatalogCategory,
	type CatalogState,
} from "@/features/catalog/catalog-demo";

export function KategoriTable({
	state,
	edit,
	disabled,
}: {
	state: CatalogState;
	edit: (value: CatalogCategory, mode: "view" | "edit") => void;
	disabled: boolean;
}) {
	const search = useSearch({ from: "/_protected/kategori" });
	const navigate = useNavigate({ from: "/kategori" });
	const { page, q: query, status } = search;
	const tableRef = useRef<HTMLTableElement>(null);
	useEffect(() => {
		tableRef.current?.parentElement?.scrollTo({ left: 0 });
	}, [query, status]);
	const update = (patch: Partial<CatalogSearch>, replace = false) => {
		void navigate({
			search: (previous) => ({ ...previous, ...patch }),
			replace,
			resetScroll: false,
		});
	};
	const setPage = (value: number) => update({ page: value });
	const setQuery = (value: string) => update({ q: value, page: 1 }, true);
	const setStatus = (value: string) =>
		update({ status: value as CatalogSearch["status"], page: 1 });
	const normalized = query.trim().toLocaleLowerCase("id-ID");
	const filtered = state.categories
		.filter(
			(row) =>
				`${row.name} ${row.code} ${row.description}`
					.toLocaleLowerCase("id-ID")
					.includes(normalized) &&
				(status === "Semua" || row.active === (status === "Aktif")),
		)
		.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "id-ID"));
	const paged = catalogPage(filtered, page);
	return (
		<section className="flex w-full min-w-0 flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
			<div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
				<div className="flex h-10 flex-col justify-center">
					<span className="text-body-medium text-text-tertiary">
						Total Kategori
					</span>
					<span className="text-body-medium text-text-primary">
						{filtered.length} kategori
					</span>
				</div>
				<div className="flex w-full max-w-full flex-wrap items-center justify-end gap-2.5 sm:w-auto sm:flex-1">
					<Select
						selectedKey={status}
						onSelectionChange={(key) => {
							setStatus(String(key));
						}}
						aria-label="Filter status kategori"
						className="w-36"
					>
						{["Semua", "Aktif", "Nonaktif"].map((value) => (
							<SelectItem key={value} id={value}>
								{value === "Semua" ? "Semua status" : value}
							</SelectItem>
						))}
					</Select>
					<Input
						placeholder="Cari nama atau kode"
						aria-label="Search kategori"
						value={query}
						onChange={(value) => {
							setQuery(value);
						}}
						leadingIcon={RiSearchLine}
						className="w-full min-w-0 sm:w-64 sm:flex-none"
						fieldClassName="rounded-full bg-background-secondary-default"
						inputClassName="text-body-medium"
					/>
				</div>
			</div>
			<Table ref={tableRef} aria-label="Kategori" className="min-w-[900px]">
				<TableHeader>
					<TableColumn id="name" isRowHeader className="w-52">
						Nama Kategori
					</TableColumn>
					<TableColumn id="code" className="w-32">
						Kode
					</TableColumn>
					<TableColumn id="description" className="w-60">
						Deskripsi
					</TableColumn>
					<TableColumn id="order" className="w-20">
						Urutan
					</TableColumn>
					<TableColumn id="productCount" className="w-36">
						Jumlah Produk
					</TableColumn>
					<TableColumn id="active" className="w-28">
						Aktif
					</TableColumn>
					<TableColumn id="actions" className="w-36">
						Aksi
					</TableColumn>
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<div className="flex flex-col items-center gap-2 p-4">
							<span className="text-body-regular text-text-tertiary">
								Tidak ada kategori yang cocok.
							</span>
							<Button
								variant="secondary"
								size="medium"
								leadingIcon={RiRefreshLine}
								onClick={() => {
									update({ q: "", status: "Semua", page: 1 });
								}}
							>
								Reset
							</Button>
						</div>
					)}
				>
					{paged.rows.map((category) => (
						<TableRow
							key={category.id}
							id={category.id}
							textValue={category.name}
						>
							<TableCell>
								<span className="inline-flex items-center gap-2 text-body-medium text-text-primary">
									<RiFolder3Line
										className="size-4 shrink-0 text-foreground-icon-secondary"
										aria-hidden
									/>
									<span className="max-w-48 truncate" title={category.name}>
										{category.name}
									</span>
								</span>
							</TableCell>
							<TableCell>
								<span className="whitespace-nowrap text-text-secondary">
									{category.code}
								</span>
							</TableCell>
							<TableCell>
								<span
									className="block max-w-60 truncate text-text-secondary"
									title={category.description}
								>
									{category.description || "—"}
								</span>
							</TableCell>
							<TableCell>{category.order}</TableCell>
							<TableCell>
								<Chip variant="subtle" color="gray">
									{
										state.products.filter(
											(row) => row.categoryId === category.id,
										).length
									}{" "}
									produk
								</Chip>
							</TableCell>
							<TableCell>
								<Switch
									size="sm"
									isSelected={category.active}
									onChange={() =>
										edit({ ...category, active: !category.active }, "edit")
									}
									isDisabled={disabled}
									aria-label={`Ubah status kategori ${category.name}`}
								/>
							</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2.5">
									<IconButton
										icon={RiEyeLine}
										size="small"
										aria-label={`Lihat kategori ${category.name}`}
										onClick={() => edit(category, "view")}
									/>
									<IconButton
										icon={RiEdit2Line}
										size="small"
										aria-label={`Edit kategori ${category.name}`}
										onClick={() => edit(category, "edit")}
										disabled={disabled}
									/>
									<IconButton
										icon={RiForbidLine}
										size="small"
										aria-label={`Nonaktifkan kategori ${category.name}`}
										onClick={() => edit({ ...category, active: false }, "edit")}
										disabled={disabled || !category.active}
									/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="mt-3 px-3">
				<Pagination
					page={paged.currentPage}
					totalPages={paged.totalPages}
					onChange={setPage}
					previousLabel="Sebelumnya"
					nextLabel="Berikutnya"
				/>
			</div>
		</section>
	);
}
