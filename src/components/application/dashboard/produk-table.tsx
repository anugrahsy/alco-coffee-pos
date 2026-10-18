"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { CatalogSearch } from "@/features/catalog/catalog-search";
import type { Selection } from "react-aria-components";
import {
	RiCakeLine,
	RiCupLine,
	RiEdit2Line,
	RiEyeLine,
	RiForbidLine,
	RiLeafLine,
	RiRefreshLine,
	RiSearchLine,
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { Checkbox } from "@/components/base/checkbox/checkbox";
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
	catalogMoney,
	catalogPage,
	type CatalogProduct,
	type CatalogState,
} from "@/features/catalog/catalog-demo";

function ProductPhoto({
	product,
	category,
}: {
	product: CatalogProduct;
	category: string;
}) {
	const [failed, setFailed] = useState(false);
	const Icon =
		category === "Coffee"
			? RiCupLine
			: category === "Non Coffee"
				? RiLeafLine
				: RiCakeLine;
	return (
		<span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background-tertiary-default">
			{product.photo && !failed ? (
				<img
					src={product.photo}
					alt={product.name}
					className="size-10 object-cover"
					loading="lazy"
					referrerPolicy="no-referrer"
					onError={() => setFailed(true)}
				/>
			) : (
				<Icon className="size-5 text-foreground-icon-secondary" aria-hidden />
			)}
		</span>
	);
}

export function ProdukTable({
	state,
	edit,
	disabled,
}: {
	state: CatalogState;
	edit: (value: CatalogProduct, mode: "view" | "edit") => void;
	disabled: boolean;
}) {
	const search = useSearch({ from: "/_protected/produk" });
	const navigate = useNavigate({ from: "/produk" });
	const {
		page,
		q: query,
		category,
		status,
		availability,
		size: pageSize,
	} = search;
	const update = (patch: Partial<CatalogSearch>, replace = false) => {
		void navigate({
			search: (previous) => ({ ...previous, ...patch }),
			replace,
			resetScroll: false,
		});
	};
	const setPage = (value: number) => update({ page: value });
	const setQuery = (value: string) => update({ q: value, page: 1 }, true);
	const setCategory = (value: string) => update({ category: value, page: 1 });
	const setStatus = (value: string) =>
		update({ status: value as CatalogSearch["status"], page: 1 });
	const setAvailability = (value: string) =>
		update({ availability: value as CatalogSearch["availability"], page: 1 });
	const setPageSize = (value: number) => update({ size: value, page: 1 });
	const [selected, setSelected] = useState<Selection>(new Set());
	const tableRef = useRef<HTMLTableElement>(null);
	useEffect(() => {
		tableRef.current?.parentElement?.scrollTo({ left: 0 });
	}, [query, category, status, availability]);
	const normalized = query.trim().toLocaleLowerCase("id-ID");
	const filtered = state.products.filter(
		(row) =>
			(row.name.toLocaleLowerCase("id-ID").includes(normalized) ||
				row.code.toLocaleLowerCase("id-ID").includes(normalized)) &&
			(category === "Semua" || row.categoryId === category) &&
			(status === "Semua" || row.active === (status === "Aktif")) &&
			(availability === "Semua" ||
				row.available === (availability === "Tersedia")),
	);
	const paged = catalogPage(filtered, page, pageSize);
	const reset = () => {
		update({
			q: "",
			category: "Semua",
			status: "Semua",
			availability: "Semua",
			page: 1,
		});
		setSelected(new Set());
	};
	const selectionChanged = () => {
		setSelected(new Set());
	};
	return (
		<section className="flex w-full min-w-0 flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
			<div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
				<div className="flex h-10 flex-col justify-center">
					<span className="text-body-medium text-text-tertiary">
						Total Produk
					</span>
					<span className="text-body-medium text-text-primary">
						{filtered.length} produk
					</span>
				</div>
				<div className="flex w-full max-w-full flex-wrap items-center justify-end gap-2.5 sm:w-auto sm:flex-1">
					<Select
						selectedKey={category}
						onSelectionChange={(key) => {
							setCategory(String(key));
							selectionChanged();
						}}
						aria-label="Filter kategori produk"
						className="w-36"
					>
						<SelectItem id="Semua">Semua kategori</SelectItem>
						{state.categories.map((row) => (
							<SelectItem key={row.id} id={row.id}>
								{row.name}
							</SelectItem>
						))}
					</Select>
					<Select
						selectedKey={status}
						onSelectionChange={(key) => {
							setStatus(String(key));
							selectionChanged();
						}}
						aria-label="Filter status produk"
						className="w-36"
					>
						{["Semua", "Aktif", "Nonaktif"].map((value) => (
							<SelectItem key={value} id={value}>
								{value === "Semua" ? "Semua status" : value}
							</SelectItem>
						))}
					</Select>
					<Select
						selectedKey={availability}
						onSelectionChange={(key) => {
							setAvailability(String(key));
							selectionChanged();
						}}
						aria-label="Filter ketersediaan produk"
						className="w-36"
					>
						{["Semua", "Tersedia", "Habis"].map((value) => (
							<SelectItem key={value} id={value}>
								{value === "Semua" ? "Ketersediaan" : value}
							</SelectItem>
						))}
					</Select>
					<Input
						placeholder="Cari nama atau kode"
						aria-label="Search produk"
						value={query}
						onChange={(value) => {
							setQuery(value);
							selectionChanged();
						}}
						leadingIcon={RiSearchLine}
						className="w-full min-w-0 sm:w-64 sm:flex-none"
						fieldClassName="rounded-full bg-background-secondary-default"
						inputClassName="text-body-medium"
					/>
				</div>
			</div>
			<Table
				ref={tableRef}
				aria-label="Produk"
				className="min-w-[1100px]"
				selectionMode="multiple"
				selectionBehavior="toggle"
				selectedKeys={selected}
				onSelectionChange={setSelected}
			>
				<TableHeader>
					<TableColumn id="select" className="w-12">
						<Checkbox
							slot="selection"
							size="sm"
							aria-label="Pilih semua produk di halaman ini"
						/>
					</TableColumn>
					<TableColumn id="photo" className="w-20">
						Foto
					</TableColumn>
					<TableColumn id="name" isRowHeader className="w-52">
						Nama Produk
					</TableColumn>
					<TableColumn id="code" className="w-28">
						Kode Produk
					</TableColumn>
					<TableColumn id="category" className="w-36">
						Kategori
					</TableColumn>
					<TableColumn id="price" className="w-32">
						Harga Jual
					</TableColumn>
					<TableColumn id="cost" className="w-32">
						HPP Estimasi
					</TableColumn>
					<TableColumn id="available" className="w-28">
						Tersedia
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
								Tidak ada produk yang cocok.
							</span>
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
					{paged.rows.map((product) => {
						const name =
							state.categories.find((row) => row.id === product.categoryId)
								?.name ?? "—";
						return (
							<TableRow
								key={product.id}
								id={product.id}
								textValue={product.name}
							>
								<TableCell>
									<Checkbox
										slot="selection"
										size="sm"
										aria-label={`Pilih ${product.name}`}
									/>
								</TableCell>
								<TableCell>
									<ProductPhoto
										key={`${product.id}-${product.photo}`}
										product={product}
										category={name}
									/>
								</TableCell>
								<TableCell>
									<span
										className="block max-w-52 truncate text-text-primary"
										title={product.name}
									>
										{product.name}
									</span>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap text-text-secondary">
										{product.code}
									</span>
								</TableCell>
								<TableCell>
									<Chip
										variant="bold"
										color={
											name === "Coffee"
												? "blue"
												: name === "Non Coffee"
													? "lime"
													: "yellow"
										}
									>
										{name}
									</Chip>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap tabular-nums text-text-primary">
										{catalogMoney(product.price)}
									</span>
								</TableCell>
								<TableCell>
									<span className="whitespace-nowrap tabular-nums text-text-secondary">
										{catalogMoney(product.cost)}
									</span>
								</TableCell>
								<TableCell>
									<Chip
										variant="subtle"
										color={product.available ? "lime" : "gray"}
									>
										{product.available ? "Tersedia" : "Habis"}
									</Chip>
								</TableCell>
								<TableCell>
									<Switch
										size="sm"
										isSelected={product.active}
										onChange={() =>
											edit({ ...product, active: !product.active }, "edit")
										}
										isDisabled={disabled}
										aria-label={`Ubah status ${product.name}`}
									/>
								</TableCell>
								<TableCell>
									<div className="flex justify-end gap-2.5">
										<IconButton
											icon={RiEyeLine}
											size="small"
											aria-label={`Lihat ${product.name}`}
											onClick={() => edit(product, "view")}
										/>
										<IconButton
											icon={RiEdit2Line}
											size="small"
											aria-label={`Edit ${product.name}`}
											onClick={() => edit(product, "edit")}
											disabled={disabled}
										/>
										<IconButton
											icon={RiForbidLine}
											size="small"
											aria-label={`Nonaktifkan ${product.name}`}
											onClick={() =>
												edit({ ...product, active: false }, "edit")
											}
											disabled={disabled || !product.active}
										/>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3">
				<Select
					aria-label="Produk per halaman"
					selectedKey={String(pageSize)}
					onSelectionChange={(key) => {
						setPageSize(Number(key));
						selectionChanged();
					}}
					className="w-36"
				>
					{[10, 20, 50].map((size) => (
						<SelectItem
							key={size}
							id={String(size)}
							textValue={`${size} per halaman`}
						>
							{size} per halaman
						</SelectItem>
					))}
				</Select>
				<Pagination
					page={paged.currentPage}
					totalPages={paged.totalPages}
					onChange={(value) => {
						setPage(value);
						setSelected(new Set());
					}}
					previousLabel="Sebelumnya"
					nextLabel="Berikutnya"
				/>
			</div>
		</section>
	);
}
