"use client";

import { useState } from "react";
import { Focusable } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import {
	compactRupiah,
	number,
	type MonitorProduct,
} from "@/features/monitor/monitor-demo";
import { cx } from "@/utils/cx";
import {
	MonitorDistribution,
	type DistributionSegment,
} from "@/components/application/dashboard/monitor-distribution";

const CARD =
	"flex min-h-[380px] min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-background-secondary-default p-4 pb-3";

/** Reference ranked-list tiles, with distinct unit and revenue rankings rather than mixing the two metrics. */
export function BestSellersCard({
	products,
	periodLabel,
	className,
}: {
	products: MonitorProduct[];
	periodLabel: string;
	className?: string;
}) {
	const [metric, setMetric] = useState<"units" | "revenue">("units");
	const sorted = products
		.filter((product) => product[metric] > 0)
		.sort(
			(a, b) =>
				b[metric] - a[metric] ||
				b.revenue - a.revenue ||
				a.name.localeCompare(b.name, "id-ID"),
		)
		.slice(0, 5);
	return (
		<section
			aria-label="Peringkat produk"
			className={cx(CARD, "gap-2", className)}
		>
			<div className="flex flex-wrap items-center justify-between gap-1">
				<p className="text-body-medium text-text-secondary">
					{metric === "units" ? "Produk terlaris" : "Kontributor pendapatan"}
				</p>
				<SegmentedControl
					selectedKeys={[metric]}
					aria-label="Peringkat berdasarkan"
					onSelectionChange={(keys) =>
						setMetric([...keys][0] as "units" | "revenue")
					}
				>
					<SegmentedControlItem id="units">Unit</SegmentedControlItem>
					<SegmentedControlItem id="revenue">Nilai</SegmentedControlItem>
				</SegmentedControl>
			</div>
			<p className="text-caption-1-medium text-text-tertiary">
				{periodLabel} ·{" "}
				{metric === "units"
					? "unit bersih setelah refund"
					: "nilai setelah diskon/refund"}
			</p>
			{!sorted.length ? (
				<p className="flex flex-1 items-center justify-center text-body-regular text-text-tertiary">
					Belum ada produk terjual.
				</p>
			) : (
				<ol className="flex flex-1 flex-col justify-between gap-1">
					{sorted.map((product, index) => (
						<li
							key={product.name}
							className="flex min-w-0 items-center gap-2 rounded-2lg bg-background-inner-default p-2"
						>
							<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background-secondary-default text-caption-1-semibold text-text-secondary tabular-nums">
								{index + 1}
							</span>
							<div className="flex min-w-0 flex-1 flex-col">
								<p
									className="truncate text-body-medium text-text-primary"
									title={product.name}
								>
									{product.name}
								</p>
								<p className="truncate text-body-2-regular text-text-tertiary">
									{product.category} · {number(product.units)} terjual
								</p>
							</div>
							<span className="shrink-0 text-body-medium text-text-primary tabular-nums">
								{compactRupiah(product.revenue)}
							</span>
						</li>
					))}
				</ol>
			)}
		</section>
	);
}

export function CategoryDonutCard({
	segments,
	periodLabel,
	className,
}: {
	segments: DistributionSegment[];
	periodLabel: string;
	className?: string;
}) {
	const [active, setActive] = useState<string | null>(null);
	const total = segments.reduce((sum, segment) => sum + segment.value, 0);
	const top =
		segments.find((segment) => segment.label === active) ??
		[...segments].sort((a, b) => b.value - a.value)[0];
	// A refund-only category may be negative: retain the actual units, never turn it into a misleading pie share.
	if (segments.some((segment) => segment.value < 0)) {
		return (
			<section
				aria-label="Kategori produk terlaris"
				className={cx(CARD, className)}
			>
				<div>
					<p className="text-body-medium text-text-secondary">
						Kategori produk terlaris
					</p>
					<p className="text-title-1-medium text-text-primary">
						{number(total)} unit bersih
					</p>
					<p className="text-caption-1-medium text-text-tertiary">
						{periodLabel}
					</p>
				</div>
				<p className="text-body-regular text-text-secondary">
					Ada refund yang melebihi penjualan kategori pada periode ini. Proporsi
					tidak ditampilkan agar tidak menyesatkan.
				</p>
				<dl className="mt-auto flex flex-col gap-2">
					{segments.map((segment) => (
						<div
							key={segment.label}
							className="flex justify-between gap-2 rounded-2lg bg-background-inner-default p-2 text-body-medium"
						>
							<dt className="text-text-secondary">{segment.label}</dt>
							<dd className="text-text-primary tabular-nums">
								{number(segment.value)} unit
							</dd>
						</div>
					))}
				</dl>
			</section>
		);
	}
	return (
		<section
			aria-label="Kategori produk terlaris"
			className={cx(CARD, className)}
		>
			<div>
				<p className="text-body-medium text-text-secondary">
					Kategori produk terlaris
				</p>
				<p className="text-title-1-medium text-text-primary tabular-nums">
					{number(total)}{" "}
					<span className="text-body-2-medium text-text-tertiary">unit</span>
				</p>
				<p className="text-caption-1-medium text-text-tertiary">
					{periodLabel}
				</p>
			</div>
			{!total ? (
				<p className="flex flex-1 items-center justify-center text-body-regular text-text-tertiary">
					Belum ada produk terjual.
				</p>
			) : (
				<>
					<MonitorDistribution
						segments={segments}
						onActive={setActive}
						center={
							<>
								<span className="text-title-1-medium text-text-primary">
									{Math.round(((top?.value ?? 0) / total) * 100)}%
								</span>
								<span className="text-caption-1-medium text-text-tertiary">
									{top?.label}
								</span>
							</>
						}
					/>
					<div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1">
						{segments.map((segment) => (
							<TooltipTrigger key={segment.label} delay={0}>
								<Focusable>
									<Button
										variant="secondary"
										size="small"
										className="min-w-0 justify-start border-transparent bg-transparent px-0 shadow-none hover:bg-background-secondary-hover"
										onFocus={() => setActive(segment.label)}
										onBlur={() => setActive(null)}
										onMouseEnter={() => setActive(segment.label)}
										onMouseLeave={() => setActive(null)}
										aria-label={`${segment.label}, ${number(segment.value)} unit`}
									>
										<span className="flex min-w-0 items-center gap-1.5">
											<span
												aria-hidden
												className="size-3 shrink-0 rounded-sm"
												style={{ backgroundColor: segment.color }}
											/>
											<span className="truncate">{segment.label}</span>
											<span className="tabular-nums">
												{number(segment.value)}
											</span>
										</span>
									</Button>
								</Focusable>
								<Tooltip>
									{segment.label}: {number(segment.value)} unit ·{" "}
									{Math.round((segment.value / total) * 100)}% · {periodLabel}
								</Tooltip>
							</TooltipTrigger>
						))}
					</div>
				</>
			)}
		</section>
	);
}
