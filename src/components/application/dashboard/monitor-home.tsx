"use client";

import { useMemo, useState } from "react";
import {
	RiCoinsFill,
	RiDashboardLine,
	RiLineChartFill,
	RiReceiptLine,
	RiShoppingBasket2Fill,
} from "@remixicon/react";
import {
	BestSellersCard,
	CategoryDonutCard,
} from "@/components/application/dashboard/monitor-charts";
import { MonitorPaymentsCard } from "@/components/application/dashboard/monitor-payments-card";
import {
	MonitorExpensesCard,
	MonitorOperations,
} from "@/components/application/dashboard/monitor-operations";
import { OrdersChartCard } from "@/components/application/dashboard/orders-chart-card";
import { PageHeader } from "@/components/application/dashboard/page-header";
import { RevenueChartCard } from "@/components/application/dashboard/revenue-chart-card";
import {
	StatCards,
	type Stat,
} from "@/components/application/dashboard/stat-cards";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import {
	DateRangePicker,
	type DateRangeValue,
} from "@/components/base/date-picker/date-range-picker";
import { Chip } from "@/components/base/badges/chip";
import {
	monitorComparison,
	monitorDelta,
} from "@/features/monitor/monitor-comparison";
import {
	businessToday,
	compactRupiah,
	formatMonitorRange,
	getMonitorDemoReport,
	monitorRange,
	number,
	rupiah,
	type MonitorPeriod,
} from "@/features/monitor/monitor-demo";

const PERIODS = {
	day: "Hari ini",
	week: "Minggu ini",
	month: "Bulan ini",
	year: "Tahun ini",
} as const;
const PROFIT_HINT =
	"Berdasarkan HPP dan biaya operasional yang dicatat; belum memperhitungkan pajak/biaya yang belum dicatat";

export function MonitorHome() {
	const [period, setPeriod] = useState<MonitorPeriod>("day");
	const [customRange, setCustomRange] = useState<DateRangeValue | null>(null);
	const [rangeError, setRangeError] = useState("");
	const [date] = useState(businessToday);
	const range = useMemo(
		() =>
			period === "custom" && customRange
				? customRange
				: monitorRange(period === "custom" ? "day" : period, date),
		[period, customRange, date],
	);
	const report = useMemo(
		() => getMonitorDemoReport(range, date),
		[range, date],
	);
	const comparison = useMemo(
		() => monitorComparison(period, range),
		[period, range],
	);
	const previous = useMemo(
		() => getMonitorDemoReport(comparison.range, date),
		[comparison, date],
	);
	const delta = (current: number, before: number) =>
		range.start.compare(date) > 0
			? { delta: "—", deltaColor: "neutral" as const }
			: monitorDelta(current, before);
	const comparisonHint = (before: number) =>
		`Pembanding ${formatMonitorRange(comparison.range)}: ${rupiah(before)}. ${range.end.compare(date) > 0 && range.start.compare(date) <= 0 ? `Periode ini masih berjalan; data sampai ${formatMonitorRange({ start: date, end: date })}. ` : ""}Persentase tidak dihitung bila nilai pembanding nol.`;
	const periodLabel = period === "custom" ? "Rentang dipilih" : PERIODS[period];
	const rangeLabel = formatMonitorRange(range);
	const money = (value: number) =>
		Math.abs(value) >= 100000000 ? compactRupiah(value) : rupiah(value);
	const stats: Stat[] = [
		{
			icon: RiCoinsFill,
			label: "Pendapatan penjualan",
			value: money(report.netSales),
			...delta(report.netSales, previous.netSales),
			tone: "blue",
			caption: comparison.caption,
			hint: `Setelah diskon/refund, tidak termasuk unpaid atau pemasukan manual. ${rupiah(report.netSales)}. ${comparisonHint(previous.netSales)}`,
		},
		{
			icon: RiShoppingBasket2Fill,
			label: "Estimasi Laba Kotor",
			value: money(report.grossProfit),
			...delta(report.grossProfit, previous.grossProfit),
			tone: "orange",
			caption: comparison.caption,
			hint: `${PROFIT_HINT}. ${rupiah(report.grossProfit)}. ${comparisonHint(previous.grossProfit)}`,
		},
		{
			icon: RiLineChartFill,
			label: "Estimasi Laba Bersih",
			value: money(report.netProfit),
			...delta(report.netProfit, previous.netProfit),
			tone: "purple",
			caption: comparison.caption,
			hint: `${PROFIT_HINT}. ${rupiah(report.netProfit)}. ${comparisonHint(previous.netProfit)}`,
		},
		{
			icon: RiReceiptLine,
			label: "Rata-rata tagihan",
			value: rupiah(report.aov),
			...delta(report.aov, previous.aov),
			tone: "pink",
			caption: comparison.caption,
			hint: `Total nilai order setelah diskon sebelum refund dibagi jumlah order dibayar. ${number(report.paidOrders)} order dibayar. ${comparisonHint(previous.aov)}`,
		},
	];
	const peak = [...report.busyHours].sort((a, b) => b.current - a.current)[0];
	return (
		<div className="flex w-full flex-col gap-4">
			<PageHeader current="Monitor" icon={RiDashboardLine} />
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-0.5 px-1">
					<span className="text-title-2-medium text-text-primary">Monitor</span>
					<span className="text-body-medium text-text-secondary">
						Ringkasan performa toko · {periodLabel.toLocaleLowerCase("id-ID")}
					</span>
				</div>
				<div className="flex max-w-full flex-wrap items-center gap-2">
					<SegmentedControl
						selectedKeys={period === "custom" ? [] : [period]}
						aria-label="Periode Monitor"
						onSelectionChange={(keys) => {
							const key = [...keys][0] as MonitorPeriod | undefined;
							if (key) {
								setPeriod(key);
								setRangeError("");
							}
						}}
					>
						{Object.entries(PERIODS).map(([key, label]) => (
							<SegmentedControlItem key={key} id={key}>
								{label}
							</SegmentedControlItem>
						))}
					</SegmentedControl>
					<DateRangePicker
						value={period === "custom" ? customRange : null}
						aria-label="Rentang tanggal Monitor"
						placeholder="Custom"
						onChange={(value) => {
							if (!value) return;
							if (value.end.compare(value.start) > 365) {
								setRangeError(
									"Preview maksimal 366 hari. Perkecil rentang tanggal.",
								);
								return;
							}
							setCustomRange(value);
							setPeriod("custom");
							setRangeError("");
						}}
					/>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2 px-1">
				<Chip color="neutral" variant="bold">
					Contoh Data
				</Chip>
				<p className="text-caption-1-medium text-text-tertiary">
					{rangeLabel} · WIB · Belum terhubung ke Supabase
				</p>
			</div>
			{rangeError && (
				<p role="alert" className="text-body-regular text-text-error-primary">
					{rangeError}
				</p>
			)}
			<StatCards variant="footer" stats={stats} />
			<div className="flex flex-col gap-4 xl:flex-row">
				<RevenueChartCard
					title="Pendapatan"
					currency="Rp"
					locale="id-ID"
					data={report.revenueTrend}
					showComparison={false}
					currentLabel="Penjualan bersih"
					periodLabel={rangeLabel}
				/>
				<OrdersChartCard data={report.orderTrend} periodLabel={rangeLabel} />
			</div>
			<MonitorOperations report={report} />
			<div className="flex flex-col gap-0.5 px-1">
				<span className="text-title-2-medium text-text-primary">
					Monitoring Produk
				</span>
				<span className="text-body-medium text-text-secondary">
					Produk terjual dan pembayaran ·{" "}
					{periodLabel.toLocaleLowerCase("id-ID")}
				</span>
			</div>
			<div className="flex flex-col gap-4 xl:flex-row">
				<BestSellersCard products={report.products} periodLabel={periodLabel} />
				<CategoryDonutCard
					segments={report.categories}
					periodLabel={periodLabel}
				/>
				<MonitorPaymentsCard
					payments={report.payments}
					periodLabel={periodLabel}
				/>
			</div>
			<div className="flex flex-col gap-4 xl:flex-row">
				<MonitorExpensesCard report={report} periodLabel={periodLabel} />
				<OrdersChartCard
					title="Jam ramai"
					headline={peak?.current ? `${peak.label} WIB` : "—"}
					data={report.busyHours}
					periodLabel={
						peak?.current
							? `${number(peak.current)} order pada jam puncak · ${periodLabel.toLocaleLowerCase("id-ID")}`
							: periodLabel
					}
				/>
			</div>
		</div>
	);
}
