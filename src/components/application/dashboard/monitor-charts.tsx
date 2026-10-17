"use client";

import type { ReactNode } from "react";
import { RiArrowDownSLine, RiCalendarLine } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { cx } from "@/utils/cx";

/**
 * Monitor dashboard charts (not in BoardUI — hand-built from the reference
 * HTMLs: "Spend by channel" donut in marketing, "Important alerts" list in
 * medical).
 */

/* ---------- Card header --------------------------------------------------- */

function CardHead({
  title,
  value,
  delta,
  deltaColor = "lime",
  right,
}: {
  title: string;
  value: string;
  delta?: string;
  deltaColor?: "lime" | "rose" | "neutral";
  right?: ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-body-medium text-text-secondary">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-title-1-medium text-text-primary">{value}</span>
          {delta && <Chip variant="bold" color={deltaColor}>{delta}</Chip>}
        </div>
      </div>
      {right}
    </div>
  );
}

function RangeButton() {
  return (
    <button
      type="button"
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-2lg border border-border-button-default bg-background-primary-default px-2.25 py-1 text-body-medium text-text-primary shadow-xs"
    >
      <RiCalendarLine className="size-4 text-text-secondary" aria-hidden />
      Last 30 days
      <RiArrowDownSLine className="size-4 text-text-secondary" aria-hidden />
    </button>
  );
}

/* ---------- Donut (half-gauge, "Spend by channel" style) ------------------ */

type DonutSegment = { label: string; value: number; color: string };

function Donut({
  segments,
  width = 338,
  strokeWidth = 26,
  center,
}: {
  segments: DonutSegment[];
  width?: number;
  strokeWidth?: number;
  center?: ReactNode;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const r = (width - strokeWidth) / 2;
  const height = r + strokeWidth / 2;
  const cx = width / 2;
  const cy = height;
  const arcLength = Math.PI * r;
  // Round caps overshoot by strokeWidth/2 each side, so the gap covers both.
  const gap = strokeWidth + 8;
  // Semicircle from the left end over the top to the right end.
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  let cumulative = 0;
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: width }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <path d={d} fill="none" stroke="#ebebeb" strokeWidth={strokeWidth} strokeLinecap="round" />
        {segments.map((segment) => {
          const frac = segment.value / total;
          const len = Math.max(frac * arcLength - gap, 0);
          const el = (
            <path
              key={segment.label}
              d={d}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${len} ${arcLength - len}`}
              strokeDashoffset={-cumulative}
              strokeLinecap="round"
            />
          );
          cumulative += frac * arcLength;
          return el;
        })}
      </svg>
      {center && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-1 text-center">
          {center}
        </div>
      )}
    </div>
  );
}

function DonutLegend({ segments }: { segments: DonutSegment[] }) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3">
      {segments.map((segment) => (
        <div key={segment.label} className="flex items-center gap-1.5">
          <span
            className="size-3 shrink-0 rounded-[4px]"
            style={{ backgroundColor: segment.color }}
            aria-hidden
          />
          <span className="truncate text-body-medium text-text-secondary">{segment.label}</span>
          <span className="text-body-medium text-text-primary tabular-nums">{segment.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Produk terlaris (ranked list) --------------------------------- */

const BEST_SELLERS = [
  { name: "Kopi Susu Gula Aren", category: "Kopi", sold: "1.284 terjual", revenue: "Rp28,2jt" },
  { name: "Americano", category: "Kopi", sold: "986 terjual", revenue: "Rp17,7jt" },
  { name: "Caffè Latte", category: "Kopi", sold: "742 terjual", revenue: "Rp18,6jt" },
  { name: "Matcha Latte", category: "Non-Kopi", sold: "538 terjual", revenue: "Rp14,0jt" },
  { name: "Cookies Classic", category: "Snack", sold: "512 terjual", revenue: "Rp7,7jt" },
];

export function BestSellersCard({ className }: { className?: string }) {
  return (
    <section
      className={cx(
        "flex h-[344px] min-w-0 flex-1 flex-col rounded-2xl bg-background-secondary-default px-4 pt-4 pb-3",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-body-medium text-text-secondary">Produk terlaris</p>
        <p className="text-caption-1-medium whitespace-nowrap text-text-secondary">bulan ini</p>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col justify-center gap-2">
        {BEST_SELLERS.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-3 rounded-2lg bg-background-inner-default p-2.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background-secondary-default text-caption-1-semibold text-text-secondary tabular-nums">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-body-medium text-text-primary">{item.name}</p>
              <p className="text-body-2-regular text-text-tertiary">
                {item.category} · {item.sold}
              </p>
            </div>
            <span className="shrink-0 text-body-medium whitespace-nowrap text-text-primary tabular-nums">
              {item.revenue}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Spend-by-channel gauge (exact reference paths) ----------------- */

const GAUGE_TRACK =
  "M15.50009 123.00202c-4.50089 0-8.77951-1.95644-11.72374-5.36078-2.94423-3.40435-4.26326-7.92036-3.61426-12.37422 8.80613-60.44315 60.63372-105.26701 121.715-105.26701 61.08128 0 112.90887 44.82386 121.715 105.26701 0.64901 4.45386-0.67005 8.96987-3.61426 12.37422-2.94421 3.40434-7.22284 5.36078-11.72373 5.36078-7.69711 0-14.22814-5.64834-15.33801-13.265-6.58627-45.20994-45.35182-78.73725-91.039-78.73725-45.68718 0-84.45272 33.52731-91.03901 78.73725-1.10987 7.61666-7.64091 13.265-15.33799 13.265";
const GAUGE_LIME =
  "M15.50009 116.55691c-4.50089 0-8.77951-1.95645-11.72374-5.36079-2.94423-3.40434-4.26326-7.92036-3.61426-12.37421 6.53245-44.83229 37.18173-82.44385 79.77199-97.893 4.23112-1.53468 8.92038-1.15443 12.84895 1.04193 3.92856 2.19636 6.70844 5.99189 7.61706 10.40007 1.55386 7.53845-2.65947 15.07517-9.89499 17.7-31.85598 11.55529-54.78066 39.68717-59.66702 73.22-1.10942 7.61705-7.64058 13.26592-15.33799 13.266";
const GAUGE_BLUE =
  "M0.17628 17.83241c-0.67667-4.44966 0.61421-8.9737 3.53713-12.39627 2.9229-3.42256 7.18915-5.40562 11.68987-5.43373 25.82211-0.16148 51.04011 7.80801 72.08 22.779 3.6669 2.60963 6.01843 6.68425 6.4434 11.16484 0.42499 4.48059-1.11853 8.92466-4.2294 12.17716-5.31999 5.56215-13.9156 6.37798-20.187 1.916-15.73701-11.19773-34.59907-17.15867-53.91301-17.038-7.69745 0.04821-14.26402-5.55984-15.42099-13.17";
const GAUGE_PURPLE =
  "M4.87442 4.21528c3.27696-3.08554 7.73335-4.59425 12.21076-4.13393 4.47742 0.46031 8.53363 2.84418 11.11422 6.53193 2.16473 3.09335 4.18588 6.28473 6.05701 9.564 2.2309 3.90929 2.65231 8.59525 1.15463 12.83983-1.49765 4.24458-4.76642 7.62851-8.95663 9.27217-7.16562 2.81087-15.3084-0.06249-19.12299-6.748-1.3994-2.45293-2.91101-4.84012-4.53-7.154-4.41336-6.30603-3.53067-14.89537 2.073-20.172";
const GAUGE_PINK =
  "M10.60431 0.79414c4.27029-1.42216 8.94791-0.91788 12.81699 1.38175 3.86905 2.29964 6.54745 6.16751 7.33901 10.59825 0.23151 1.29553 0.4422 2.5947 0.63199 3.89699 0.64902 4.45386-0.67004 8.96987-3.61425 12.37422-2.94421 3.40434-7.22284 5.36079-11.72373 5.36079-7.69711 0-14.22815-5.64835-15.33801-13.265-0.14206-0.97413-0.29974-1.94592-0.47299-2.91501-1.35385-7.57696 3.0575-14.99959 10.35998-17.43199";

function SpendGauge({ percent, label }: { percent: string; label: string }) {
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 338 }}>
      <svg viewBox="0 0 338 165" className="h-auto w-full">
        <g transform="translate(47.123 5.698)">
          <path d={GAUGE_TRACK} fill="#EBEBEB" />
        </g>
        <g transform="translate(47.123 12.143)">
          <path d={GAUGE_LIME} fill="#9ae600" />
        </g>
        <g transform="translate(152.829 5.701)">
          <path d={GAUGE_BLUE} fill="#3392FF" />
        </g>
        <g transform="translate(241.575 51.563)">
          <path d={GAUGE_PURPLE} fill="#c27aff" />
        </g>
        <g transform="translate(259.323 94.294)">
          <path d={GAUGE_PINK} fill="#fb64b6" />
        </g>
        <text
          x={134.54}
          y={111}
          fontSize={32}
          fontWeight={500}
          fill="#0a0a0a"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {percent}
        </text>
        <text
          x={134.79}
          y={127}
          fontSize={12}
          fontWeight={500}
          fill="#a1a1a1"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ---------- Kategori produk terlaris (donut, "Spend by channel") ---------- */

const CATEGORY_SEGMENTS: DonutSegment[] = [
  { label: "Coffee", value: 483, color: "#9ae600" },
  { label: "Non coffee", value: 315, color: "#3392ff" },
  { label: "Snack", value: 137, color: "#c27aff" },
  { label: "Dessert", value: 115, color: "#fb64b6" },
];

export function CategoryDonutCard({ className }: { className?: string }) {
  return (
    <section
      className={cx(
        "flex h-[344px] min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-background-secondary-default p-4 pb-3",
        className,
      )}
    >
      <CardHead
        title="Kategori produk terlaris"
        value="1.050"
        delta="+8.4%"
        right={<RangeButton />}
      />
      <SpendGauge percent="46%" label="Coffee" />
      <DonutLegend segments={CATEGORY_SEGMENTS} />
    </section>
  );
}

/* ---------- Metode pembayaran (donut) ------------------------------------ */

const PAYMENT_SEGMENTS: DonutSegment[] = [
  { label: "QRIS", value: 48, color: "#3b82f6" },
  { label: "Tunai", value: 35, color: "#f97316" },
  { label: "Transfer", value: 17, color: "#10b981" },
];

export function PaymentDonutCard({ className }: { className?: string }) {
  const total = PAYMENT_SEGMENTS.reduce((sum, segment) => sum + segment.value, 0);
  const top = PAYMENT_SEGMENTS[0];
  return (
    <section
      className={cx(
        "flex h-[344px] min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-background-secondary-default p-4 pb-3",
        className,
      )}
    >
      <CardHead title="Metode pembayaran" value="3 metode" />
      <Donut
        segments={PAYMENT_SEGMENTS}
        center={
          <>
            <span className="text-[32px] leading-[44px] font-medium text-text-primary">
              {Math.round((top.value / total) * 100)}%
            </span>
            <span className="text-caption-1-medium text-text-tertiary">{top.label}</span>
          </>
        }
      />
      <DonutLegend segments={PAYMENT_SEGMENTS} />
    </section>
  );
}
