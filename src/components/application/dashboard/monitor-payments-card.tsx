"use client";

import { useState } from "react";
import { Focusable } from "react-aria-components";
import { RiBankLine, RiQrCodeLine, RiWallet3Line } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import {
	number,
	rupiah,
	type MonitorPayment,
} from "@/features/monitor/monitor-demo";
import { MonitorDistribution } from "@/components/application/dashboard/monitor-distribution";

const METHODS = {
	Tunai: { icon: RiWallet3Line, color: "var(--color-chart-2-active)" },
	"QRIS Manual": { icon: RiQrCodeLine, color: "var(--color-chart-4-active)" },
	"Transfer Manual": { icon: RiBankLine, color: "var(--color-chart-1-active)" },
};

/** Payment analysis, not a payment-method selector: amount, successful payment count, and revenue share. */
export function MonitorPaymentsCard({
	payments,
	periodLabel,
}: {
	payments: MonitorPayment[];
	periodLabel: string;
}) {
	const [active, setActive] = useState<string | null>(null);
	const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
	const count = payments.reduce((sum, payment) => sum + payment.count, 0);
	const selected =
		payments.find((payment) => payment.method === active) ??
		[...payments].sort((a, b) => b.amount - a.amount)[0];
	const share = (amount: number) =>
		total > 0 ? Math.round((amount / total) * 100) : 0;
	return (
		<section
			aria-label="Metode pembayaran"
			className="flex min-h-[380px] min-w-0 flex-1 flex-col gap-2 rounded-2xl bg-background-secondary-default p-4 pb-3"
		>
			<div>
				<p className="text-body-medium text-text-secondary">
					Metode pembayaran
				</p>
				<p className="text-title-1-medium text-text-primary tabular-nums">
					{rupiah(total)}
				</p>
				<p className="text-caption-1-medium text-text-tertiary">
					{number(count)} pembayaran · {periodLabel}
				</p>
			</div>
			{!count ? (
				<p className="flex flex-1 items-center justify-center text-body-regular text-text-tertiary">
					Belum ada pembayaran pada periode ini.
				</p>
			) : (
				<>
					<MonitorDistribution
						maxWidth={176}
						segments={payments.map((payment) => ({
							label: payment.method,
							value: payment.amount,
							color: METHODS[payment.method].color,
						}))}
						onActive={setActive}
						center={
							<>
								<span className="text-title-1-medium text-text-primary">
									{share(selected?.amount ?? 0)}%
								</span>
								<span className="text-caption-1-medium text-text-tertiary">
									{selected?.method}
								</span>
							</>
						}
					/>
					<div className="mt-auto flex flex-col gap-2">
						{payments.map((payment) => (
							<TooltipTrigger key={payment.method} delay={0}>
								<Focusable>
									<Button
										variant="secondary"
										size="small"
										leadingIcon={METHODS[payment.method].icon}
										className="h-auto min-h-14 w-full min-w-0 justify-start gap-3 border-transparent bg-background-inner-default px-3 py-2 text-text-primary shadow-none hover:bg-background-secondary-hover [&>svg]:box-content [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:rounded-md [&>svg]:bg-background-secondary-default [&>svg]:p-1 [&>svg]:text-foreground-icon-secondary [&>span]:min-w-0 [&>span]:flex-1 [&>span]:shrink [&>span]:justify-start [&>span]:px-0"
										onFocus={() => setActive(payment.method)}
										onBlur={() => setActive(null)}
										onMouseEnter={() => setActive(payment.method)}
										onMouseLeave={() => setActive(null)}
										aria-label={`${payment.method}, ${rupiah(payment.amount)}, ${payment.count} pembayaran, ${share(payment.amount)} persen`}
									>
										<span className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
											<span className="flex min-w-0 flex-col items-start">
												<span className="truncate">{payment.method}</span>
												<span className="text-caption-1-medium text-text-tertiary">
													{number(payment.count)} pembayaran
												</span>
											</span>
											<span className="flex shrink-0 flex-col items-end">
												<span className="text-body-2-medium tabular-nums">
													{rupiah(payment.amount)}
												</span>
												<span className="text-caption-1-medium text-text-tertiary">
													{share(payment.amount)}%
												</span>
											</span>
										</span>
									</Button>
								</Focusable>
								<Tooltip>
									{payment.method}: {rupiah(payment.amount)} ·{" "}
									{number(payment.count)} pembayaran · {share(payment.amount)}%
									dari nilai pembayaran · {periodLabel}. QRIS/transfer
									dikonfirmasi manual.
								</Tooltip>
							</TooltipTrigger>
						))}
					</div>
					<p className="text-caption-1-medium text-text-tertiary">
						Sebelum refund; bukan saldo kas/bank.
					</p>
				</>
			)}
		</section>
	);
}
