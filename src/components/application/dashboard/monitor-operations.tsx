import {
	RiBox3Line,
	RiRefund2Line,
	RiShoppingBag3Line,
	RiTimeLine,
} from "@remixicon/react";
import { StatCards } from "@/components/application/dashboard/stat-cards";
import {
	number,
	rupiah,
	type MonitorReport,
} from "@/features/monitor/monitor-demo";

export function MonitorOperations({ report }: { report: MonitorReport }) {
	return (
		<div className="flex flex-col gap-2">
			<StatCards
				stats={[
					{
						icon: RiShoppingBag3Line,
						label: "Order dibayar",
						value: number(report.paidOrders),
						delta: "Lunas",
						deltaColor: "neutral",
					},
					{
						icon: RiBox3Line,
						label: "Item terjual bersih",
						value: number(report.netUnits),
						delta: "Unit",
						deltaColor: "neutral",
					},
					{
						icon: RiRefund2Line,
						label: "Refund periode",
						value: rupiah(report.refunds),
						delta: `${number(report.refundCount)} order`,
						deltaColor: "neutral",
					},
					{
						icon: RiTimeLine,
						label: "Tagihan belum dibayar",
						value: rupiah(report.pending.amount),
						delta: `${number(report.pending.count)} order`,
						deltaColor: "neutral",
					},
				]}
			/>
			<p className="px-1 text-caption-1-medium text-text-tertiary">
				Tagihan belum dibayar: saat ini — semua tanggal, tidak mengikuti filter
				periode dan belum menjadi pendapatan.
			</p>
		</div>
	);
}

export function MonitorExpensesCard({
	report,
	periodLabel,
}: {
	report: MonitorReport;
	periodLabel: string;
}) {
	return (
		<section
			aria-label="Pengeluaran periode"
			className="flex h-[344px] min-h-[344px] min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-background-secondary-default p-4 pb-3"
		>
			<div>
				<p className="text-body-medium text-text-secondary">
					Pengeluaran periode
				</p>
				<p className="text-title-1-medium text-text-primary tabular-nums">
					{rupiah(report.materialExpenses + report.operatingExpenses)}
				</p>
				<p className="text-caption-1-medium text-text-tertiary">
					{periodLabel}
				</p>
			</div>
			<dl className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-2lg bg-background-inner-default p-3">
					<dt className="text-body-medium text-text-secondary">
						Bahan baku & kemasan
					</dt>
					<dd className="text-body-medium text-text-primary tabular-nums">
						{rupiah(report.materialExpenses)}
					</dd>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-2lg bg-background-inner-default p-3">
					<dt className="text-body-medium text-text-secondary">
						Biaya operasional
					</dt>
					<dd className="text-body-medium text-text-primary tabular-nums">
						{rupiah(report.operatingExpenses)}
					</dd>
				</div>
			</dl>
			<p className="mt-auto text-body-2-regular text-text-tertiary">
				Hanya biaya operasional yang mengurangi estimasi laba bersih. Pembelian
				bahan/kemasan tidak dipotong lagi karena sudah diwakili HPP per porsi.
			</p>
		</section>
	);
}
