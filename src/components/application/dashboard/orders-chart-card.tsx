"use client";

import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { number } from "@/features/monitor/monitor-demo";
import { cx } from "@/utils/cx";
import {
	ChartReadout,
	ChartTable,
	ChartViewport,
	chartScale,
} from "@/components/application/dashboard/chart-primitives";

export type OrdersPoint = { label: string; current: number; previous: number };

/** Installed BoardUI Free orders card. Single-series mode preserves Monitor's rounded bars/grey tracks. */
export function OrdersChartCard({
	data,
	title = "Order dibayar",
	periodLabel,
	className,
	headline,
}: {
	data: OrdersPoint[];
	title?: string;
	periodLabel?: string;
	className?: string;
	headline?: string;
}) {
	const total = data.reduce((sum, point) => sum + point.current, 0);
	const empty = !data.length || data.every((point) => point.current === 0);
	const scale = chartScale(
		data.map((point) => point.current),
		true,
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
					<p className="text-title-1-medium text-text-primary tabular-nums">
						{headline ?? number(total)}
					</p>
					<p className="text-body-2-medium text-text-tertiary">{periodLabel}</p>
				</div>
				<span className="flex items-center gap-1.5 text-body-2-medium text-text-secondary">
					<span aria-hidden className="size-2 rounded-full bg-chart-2-active" />
					Pembayaran berhasil
				</span>
			</div>
			{empty ? (
				<p className="flex flex-1 items-center justify-center text-body-regular text-text-tertiary">
					Belum ada order dibayar pada periode ini.
				</p>
			) : (
				<div className="relative min-h-0 min-w-0 flex-1">
					<ChartViewport>
						{(size) => (
							<BarChart
								width={size.width}
								height={size.height}
								accessibilityLayer
								data={data}
								margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
								barCategoryGap="28%"
							>
								<YAxis
									width={48}
									domain={scale.domain}
									ticks={scale.ticks}
									allowDecimals={false}
									tickFormatter={(value) =>
										new Intl.NumberFormat("id-ID", {
											notation: "compact",
											maximumFractionDigits: 1,
										}).format(value)
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
										<ChartReadout {...props} periodLabel={periodLabel} />
									)}
									cursor={{ fill: "var(--color-chart-track)", opacity: 0.4 }}
								/>
								<Bar
									name="Order dibayar"
									dataKey="current"
									fill="var(--color-chart-2-active)"
									radius={[10, 10, 10, 10]}
									background={{ fill: "var(--color-chart-track)", radius: 10 }}
									maxBarSize={32}
									isAnimationActive={false}
								/>
							</BarChart>
						)}
					</ChartViewport>
				</div>
			)}
			<ChartTable data={data} title={title} />
		</section>
	);
}
