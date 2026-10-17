"use client";

import { useId } from "react";
import { Area, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { Chip } from "@/components/base/badges/chip";
import { cx } from "@/utils/cx";
import {
	ChartReadout,
	ChartTable,
	ChartViewport,
	chartScale,
	compactMoney,
} from "@/components/application/dashboard/chart-primitives";

/** Installed BoardUI Free card, extended for filtered periods and stable, immediate hover readouts. */
export type RevenuePoint = { label: string; current: number; previous: number };
export const REVENUE_DATA: RevenuePoint[] = [
	{ label: "Jan", current: 9840, previous: 8210 },
	{ label: "Feb", current: 10120, previous: 8460 },
	{ label: "Mar", current: 11380, previous: 9950 },
	{ label: "Apr", current: 10960, previous: 10240 },
	{ label: "May", current: 12210, previous: 10880 },
	{ label: "Jun", current: 12740, previous: 11020 },
	{ label: "Jul", current: 13980, previous: 11760 },
	{ label: "Aug", current: 13120, previous: 12030 },
	{ label: "Sep", current: 14210, previous: 12190 },
	{ label: "Oct", current: 14690, previous: 12480 },
	{ label: "Nov", current: 14360, previous: 12160 },
	{ label: "Dec", current: 14703.92, previous: 11924 },
];

export function RevenueChartCard({
	data = REVENUE_DATA,
	title = "Revenue",
	currency = "$",
	locale = "en-US",
	className,
	showComparison = true,
	periodLabel,
	currentLabel = "Tahun ini",
	previousLabel = "Tahun lalu",
}: {
	data?: RevenuePoint[];
	title?: string;
	currency?: string;
	locale?: string;
	className?: string;
	showComparison?: boolean;
	periodLabel?: string;
	currentLabel?: string;
	previousLabel?: string;
} = {}) {
	const gradientId = useId();
	const total = data.reduce((sum, point) => sum + point.current, 0);
	const previous = data.reduce((sum, point) => sum + point.previous, 0);
	const delta = previous > 0 ? ((total - previous) / previous) * 100 : null;
	const money = currency.trim() === "Rp";
	const format = (value: number) =>
		`${currency}${Math.round(value).toLocaleString(locale)}`;
	const empty =
		!data.length ||
		data.every(
			(point) =>
				point.current === 0 && (!showComparison || point.previous === 0),
		);
	const scale = chartScale(
		data.flatMap((point) =>
			showComparison ? [point.current, point.previous] : [point.current],
		),
	);
	return (
		<section
			aria-label={title}
			className={cx(
				"flex h-[344px] min-h-[344px] min-w-0 flex-1 flex-col gap-6 rounded-2xl bg-background-secondary-default px-4 pt-4 pb-3",
				className,
			)}
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-0.5">
					<p className="text-body-medium text-text-secondary">{title}</p>
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-title-1-medium text-text-primary tabular-nums">
							{format(total)}
						</p>
						{showComparison && delta !== null && (
							<Chip
								variant="bold"
								color={delta > 0 ? "lime" : delta < 0 ? "rose" : "neutral"}
							>
								{delta > 0 ? "+" : ""}
								{delta.toFixed(1)}%
							</Chip>
						)}
					</div>
					<p className="text-body-2-medium text-text-tertiary">
						{periodLabel ?? `${format(previous)} tahun lalu`}
					</p>
				</div>
				<div className="flex flex-wrap gap-4 text-body-2-medium text-text-secondary">
					<span className="flex items-center gap-1.5">
						<span
							aria-hidden
							className="size-2 rounded-full bg-chart-2-active"
						/>
						{currentLabel}
					</span>
					{showComparison && (
						<span className="flex items-center gap-1.5">
							<span
								aria-hidden
								className="size-2 rounded-full bg-chart-neutral"
							/>
							{previousLabel}
						</span>
					)}
				</div>
			</div>
			{empty ? (
				<p className="flex flex-1 items-center justify-center text-body-regular text-text-tertiary">
					Belum ada penjualan pada periode ini.
				</p>
			) : (
				<div className="relative min-h-0 min-w-0 flex-1">
					<ChartViewport>
						{(size) => (
							<ComposedChart
								width={size.width}
								height={size.height}
								accessibilityLayer
								data={data}
								margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
							>
								<defs>
									<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="0%"
											stopColor="var(--color-chart-2)"
											stopOpacity={0.35}
										/>
										<stop
											offset="100%"
											stopColor="var(--color-chart-2)"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<YAxis
									width={money ? 68 : 48}
									domain={scale.domain}
									ticks={scale.ticks}
									tickFormatter={(value) =>
										money
											? compactMoney(value)
											: `${currency}${new Intl.NumberFormat(locale, { notation: "compact" }).format(value)}`
									}
									tickLine={false}
									axisLine={false}
									tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
								/>
								<XAxis
									dataKey="label"
									minTickGap={16}
									tickLine={false}
									axisLine={false}
									tickMargin={12}
									interval="preserveStartEnd"
									tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
								/>
								<Tooltip
									content={(props) => (
										<ChartReadout
											{...props}
											money={money}
											periodLabel={periodLabel}
										/>
									)}
									cursor={{
										stroke: "var(--color-chart-cursor)",
										strokeDasharray: "4 4",
									}}
								/>
								{showComparison && (
									<Line
										type="monotone"
										name={previousLabel}
										dataKey="previous"
										stroke="var(--color-chart-neutral)"
										strokeWidth={2}
										strokeDasharray="5 5"
										dot={false}
										isAnimationActive={false}
									/>
								)}
								<Area
									type="monotone"
									name={currentLabel}
									dataKey="current"
									stroke="none"
									fill={`url(#${gradientId})`}
									isAnimationActive={false}
								/>
								<Line
									type="monotone"
									name={currentLabel}
									dataKey="current"
									stroke="var(--color-chart-2-active)"
									strokeWidth={2.5}
									dot={data.length === 1}
									activeDot={{
										r: 4,
										stroke: "var(--color-background-secondary-default)",
										strokeWidth: 2,
									}}
									isAnimationActive={false}
								/>
							</ComposedChart>
						)}
					</ChartViewport>
				</div>
			)}
			<ChartTable
				data={data}
				title={title}
				money={money}
				comparison={showComparison}
			/>
		</section>
	);
}
