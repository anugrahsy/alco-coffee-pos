"use client";

import { Chip } from "@/components/base/badges/chip";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import { cx } from "@/utils/cx";

/**
 * Bar chart card: a metric headline + 12 rounded bars on grey tracks, with the
 * BoardUI Weekly/Monthly/Yearly segmented control. Reused by "Earned so far"
 * (Home) and "Jumlah orderan" (Monitor).
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BAR_X = [0, 49.75, 99.5, 149.25, 199, 248.75, 298.5, 348.25, 398, 447.75, 497.5, 547.25];

const TONE_TO_COLOR = { up: "lime", down: "rose", flat: "neutral" } as const;

export function BarChartCard({
  title,
  value,
  delta,
  deltaTone = "up",
  bars,
  yLabels,
  barColor = "#9ae600",
  className,
}: {
  title: string;
  value: string;
  delta: string;
  deltaTone?: "up" | "down" | "flat";
  /** Twelve bar heights, one per month (Jan → Dec). */
  bars: number[];
  /** Y-axis labels, top → bottom. */
  yLabels: [string, string, string, string];
  barColor?: string;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "flex min-w-0 flex-1 flex-col gap-6 rounded-2xl bg-background-secondary-default p-4 pb-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-body-medium text-text-secondary">{title}</span>
          <div className="flex h-8.5 items-center gap-2">
            <span className="text-title-1-medium text-text-primary">{value}</span>
            <Chip variant="bold" color={TONE_TO_COLOR[deltaTone]}>
              {delta}
            </Chip>
          </div>
        </div>
        <SegmentedControl defaultSelectedKeys={["Weekly"]}>
          <SegmentedControlItem id="Weekly">Weekly</SegmentedControlItem>
          <SegmentedControlItem id="Monthly">Monthly</SegmentedControlItem>
          <SegmentedControlItem id="Yearly">Yearly</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <svg viewBox="0 0 641 221" className="h-auto w-full grow">
        {bars.map((_, i) => (
          <rect key={i} x={BAR_X[i]} y={4} width={32} height={187} rx={10} fill="#ebebeb" />
        ))}
        {bars.map((height, i) => (
          <rect key={i} x={BAR_X[i]} y={191 - height} width={32} height={height} rx={10} fill={barColor} />
        ))}
        <g fill="#a1a1a1" fontFamily="Inter, system-ui, sans-serif" fontSize={12}>
          <text x={0} y={39}>{yLabels[0]}</text>
          <text x={0} y={117}>{yLabels[1]}</text>
          <text x={0} y={148}>{yLabels[2]}</text>
          <text x={0} y={194}>{yLabels[3]}</text>
        </g>
        <g fill="#a1a1a1" fontFamily="Inter, system-ui, sans-serif" fontSize={13}>
          {MONTHS.map((month, i) => (
            <text key={month} x={BAR_X[i] + 3} y={216}>
              {month}
            </text>
          ))}
        </g>
      </svg>
    </section>
  );
}
