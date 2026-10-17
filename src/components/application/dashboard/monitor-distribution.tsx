"use client";

import type { ReactNode } from "react";

export type DistributionSegment = {
	label: string;
	value: number;
	color: string;
};

/** Data-driven version of the reference half gauge; no fixed reference paths or division by zero. */
export function MonitorDistribution({
	segments,
	center,
	maxWidth = 338,
	onActive,
}: {
	segments: DistributionSegment[];
	center?: ReactNode;
	maxWidth?: number;
	onActive?: (label: string | null) => void;
}) {
	const positive = segments.filter(
		(segment) => Number.isFinite(segment.value) && segment.value > 0,
	);
	const total = positive.reduce((sum, segment) => sum + segment.value, 0);
	let start = 0;
	return (
		<div
			className="relative mx-auto w-full"
			style={{ maxWidth }}
			onMouseLeave={() => onActive?.(null)}
		>
			<svg aria-hidden viewBox="0 0 248 132" className="block h-auto w-full">
				<path
					d="M19 118 A105 105 0 0 1 229 118"
					fill="none"
					stroke="var(--color-chart-track)"
					strokeWidth={24}
					strokeLinecap="round"
				/>
				{positive.map((segment) => {
					const share = segment.value / total;
					const rounded = share > 0.1;
					const gap =
						positive.length > 1
							? rounded
								? 0.27
								: Math.min(0.025, (share * Math.PI) / 3)
							: 0;
					const from = Math.PI - start * Math.PI - gap / 2;
					const to = Math.PI - (start + share) * Math.PI + gap / 2;
					start += share;
					const point = (angle: number) =>
						`${124 + 105 * Math.cos(angle)} ${118 - 105 * Math.sin(angle)}`;
					return (
						<path
							key={segment.label}
							d={`M${point(from)} A105 105 0 0 1 ${point(to)}`}
							fill="none"
							stroke={segment.color}
							strokeWidth={24}
							strokeLinecap={rounded ? "round" : "butt"}
							onMouseEnter={() => onActive?.(segment.label)}
						/>
					);
				})}
			</svg>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center text-center">
				{center}
			</div>
		</div>
	);
}
