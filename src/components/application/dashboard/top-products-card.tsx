"use client";

import { useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { LinkButton } from "@/components/base/buttons/link-button";
import {
	salesMoney,
	salesNumber,
	type ProductRecap,
} from "@/features/sales/sales-demo";

/** Same horizontal product tiles; quantities and values follow the sales report. */
export function TopProductsCard({
	products,
	periodLabel,
}: {
	products: ProductRecap[];
	periodLabel: string;
}) {
	const [all, setAll] = useState(false);
	const visible = all ? products : products.slice(0, 5);
	return (
		<section
			aria-label="Rekap produk"
			className="flex min-w-0 flex-col gap-3 rounded-2xl bg-background-secondary-default p-4"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-col gap-0.5">
					<h2 className="text-body-medium text-text-primary">
						Rekap produk · {periodLabel}
					</h2>
					<span className="text-caption-1-medium text-text-tertiary">
						Unit dan nilai bersih setelah diskon/refund
					</span>
				</div>
				{products.length > 5 && (
					<LinkButton
						variant="secondary"
						size="small"
						onClick={() => setAll((value) => !value)}
					>
						{all ? "Tampilkan ringkas" : `Lihat semua (${products.length})`}
					</LinkButton>
				)}
			</div>
			{products.length === 0 ? (
				<p className="py-3 text-body-regular text-text-secondary">
					Belum ada produk terjual atau direfund pada periode ini.
				</p>
			) : (
				<div
					className="flex gap-4 overflow-x-auto pb-1"
					tabIndex={0}
					role="region"
					aria-label="Kartu rekap produk"
				>
					{visible.map((product, index) => (
						<div
							key={product.id}
							className="flex min-h-28 w-48 shrink-0 flex-col justify-between gap-3 rounded-2lg bg-background-primary-default p-4 shadow-card xl:w-[calc((100%-4rem)/5)] xl:min-w-40"
						>
							<div className="flex items-center gap-2">
								<Avatar
									size="lg"
									color={
										(["lime", "blue", "pink", "neutral"] as const)[index % 4]
									}
									initials={product.name[0]}
									className="rounded-xl"
								/>
								<div className="flex min-w-0 flex-1 flex-col justify-center">
									<span
										title={product.name}
										className="truncate text-body-medium text-text-primary"
									>
										{product.name}
									</span>
									<span className="text-body-2-medium text-text-secondary">
										{salesNumber(product.netUnits)}{" "}
										{product.netUnits < 0 ? "unit bersih" : "terjual"}
									</span>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="flex min-h-6 w-full items-center justify-center rounded-md bg-background-secondary-default px-1.5">
									<span className="text-caption-1-medium tabular-nums text-text-secondary">
										{salesMoney(product.revenue)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
