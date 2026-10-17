"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { compactRupiah, number, rupiah } from "@/features/monitor/monitor-demo";

/** Only mount charts after their plot has a real size; hidden/unmounting plots never pass 0 to Recharts. */
export function ChartViewport({
	children,
}: {
	children: (size: { width: number; height: number }) => ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const measure = () => {
			const rect = element.getBoundingClientRect();
			const next = {
				width: Math.round(rect.width),
				height: Math.round(rect.height),
			};
			setSize((previous) =>
				previous.width === next.width && previous.height === next.height
					? previous
					: next,
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return (
		<div ref={ref} className="absolute inset-0">
			{size.width > 0 && size.height > 0 ? children(size) : null}
		</div>
	);
}

export const chartScale = (
	values: number[],
	integer = false,
): { domain: [number, number]; ticks: number[] } => {
	const finite = values.filter(Number.isFinite);
	const min = Math.min(0, ...finite),
		max = Math.max(0, ...finite);
	if (min === max) return { domain: [0, 1], ticks: [0, 1] };
	const rough = (max - min) / 3;
	const power = 10 ** Math.floor(Math.log10(rough));
	const normalized = rough / power;
	const step = Math.max(
		integer ? 1 : 0,
		(normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
			power,
	);
	const lower = Math.floor(min / step) * step,
		upper = Math.ceil(max / step) * step;
	return {
		domain: [lower, upper],
		ticks: Array.from(
			{ length: Math.round((upper - lower) / step) + 1 },
			(_, index) => lower + index * step,
		),
	};
};
export const compactMoney = (value: number) =>
	compactRupiah(value).replace(/\s/g, "");

export function ChartReadout({
	active,
	payload,
	label,
	money = false,
	periodLabel,
}: {
	active?: boolean;
	payload?: readonly { value?: unknown; name?: unknown }[];
	label?: unknown;
	money?: boolean;
	periodLabel?: string;
}) {
	if (!active || !payload?.length) return null;
	const unique = [
		...new Map(payload.map((item) => [String(item.name), item])).values(),
	];
	return (
		<div className="max-w-60 rounded-xl border border-border-button-default bg-background-primary-default p-3 text-body-2-medium text-text-primary shadow-dropdown">
			<p>{String(label ?? "")}</p>
			{periodLabel && (
				<p className="text-caption-1-medium text-text-tertiary">
					{periodLabel} · WIB
				</p>
			)}
			<dl className="mt-2 flex flex-col gap-1">
				{unique.map((item) => (
					<div
						key={String(item.name)}
						className="flex items-center justify-between gap-4"
					>
						<dt className="text-text-secondary">{String(item.name)}</dt>
						<dd className="tabular-nums">
							{money ? rupiah(Number(item.value)) : number(Number(item.value))}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

export function ChartTable({
	data,
	title,
	money = false,
	comparison = false,
}: {
	data: { label: string; current: number; previous: number }[];
	title: string;
	money?: boolean;
	comparison?: boolean;
}) {
	const format = money ? rupiah : number;
	return (
		<table className="sr-only">
			<caption>{title}</caption>
			<thead>
				<tr>
					<th scope="col">Waktu</th>
					<th scope="col">Periode dipilih</th>
					{comparison && <th scope="col">Pembanding</th>}
				</tr>
			</thead>
			<tbody>
				{data.map((point, index) => (
					<tr key={`${point.label}-${index}`}>
						<th scope="row">{point.label}</th>
						<td>{format(point.current)}</td>
						{comparison && <td>{format(point.previous)}</td>}
					</tr>
				))}
			</tbody>
		</table>
	);
}
