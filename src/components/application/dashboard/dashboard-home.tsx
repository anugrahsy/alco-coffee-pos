"use client";

import { useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBox3Line,
  RiEqualizer3Line,
  RiGroupLine,
  RiMessage2Line,
  RiShoppingBag3Line,
} from "@remixicon/react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { CustomersTable } from "./customers-table";
import { BarChartCard } from "./bar-chart-card";
import { PageHeader } from "./page-header";

/* ---------------------------------------------------------------------------
 * Board UI → dashboard 1 (Home). Replicated 1:1 from docs/reference-dashboard.html.
 * ------------------------------------------------------------------------- */

/* ---------- Small primitives ---------------------------------------------- */

function DeltaBadge({
  value,
  tone,
}: {
  value: string;
  tone: "up" | "down" | "flat";
}) {
  const palette =
    tone === "up"
      ? "bg-[#d8f999] text-[#3d6300]"
      : tone === "down"
        ? "bg-[#ffccd3] text-[#a50036]"
        : "bg-[#ebebeb] text-[#737373]";
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-md px-1.5 text-body-medium",
        palette,
      )}
    >
      {value}
    </span>
  );
}

/** Segmented control with a white pill behind the selected option. */
function PillSegmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-2lg bg-background-secondary-default p-1">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cx(
              "flex h-7 cursor-pointer items-center justify-center rounded-md px-2.5 text-body-medium transition-colors",
              active
                ? "bg-background-primary-default font-medium text-text-primary shadow-[0_1px_0_#0000000d]"
                : "font-normal text-text-secondary",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Text-only segmented control (Activity header). */
function TextSegmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cx(
              "h-7 cursor-pointer rounded-md px-2.5 text-body-medium transition-colors",
              active ? "font-medium text-text-primary" : "font-normal text-text-secondary",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Metric label + big number + delta, shared by the chart cards. */
function MetricHead({
  label,
  value,
  delta,
  deltaTone,
  right,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down" | "flat";
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-body-medium text-text-secondary">{label}</span>
        <div className="flex h-8.5 items-center gap-2">
          <span className="text-title-1-medium text-text-primary">{value}</span>
          <DeltaBadge value={delta} tone={deltaTone} />
        </div>
      </div>
      {right}
    </div>
  );
}

/* ---------- Header -------------------------------------------------------- */

function HeaderActions() {
  return (
    <div className="flex items-center justify-end gap-2.5">
      <Button variant="secondary" leadingIcon={RiEqualizer3Line}>
        Filters
      </Button>
      <Button leadingIcon={RiAddLine}>Create ticket</Button>
    </div>
  );
}

/* ---------- Recent hires -------------------------------------------------- */

const RECENT_HIRES = [
  { name: "Livia Saris", joined: "Joined today", role: "Backend Engineer", color: "lime" as const },
  { name: "Jaydon Aminoff", joined: "2 days ago", role: "UI Designer", color: "blue" as const },
  { name: "Maria Lubin", joined: "5 days ago", role: "User Researcher", color: "pink" as const },
  { name: "Ann Press", joined: "A week ago", role: "DevOps Engineer", color: "neutral" as const },
];

function RecentHiresCard() {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl bg-background-secondary-default p-2">
      <div className="flex h-[67px] items-start justify-between px-2 pt-2">
        <div className="flex h-14 flex-col gap-0.5">
          <span className="text-body-medium text-text-secondary">Recent hires</span>
          <span className="text-title-1-medium text-text-primary">56</span>
        </div>
        <button
          type="button"
          className="flex h-5 cursor-pointer items-center gap-1.5 rounded-2lg px-0.5 text-body-medium text-text-primary"
        >
          Alco Kopi
          <RiArrowDownSLine className="size-4 text-text-secondary" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {[0, 2].map((start) => (
          <div key={start} className="flex gap-2">
            {RECENT_HIRES.slice(start, start + 2).map((hire) => (
              <div
                key={hire.name}
                className="flex h-[95px] min-w-0 flex-1 flex-col justify-between rounded-2lg bg-background-primary-default p-2.5 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <Avatar size="lg" color={hire.color} initials={hire.name[0]} />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="truncate text-body-medium text-text-primary">{hire.name}</span>
                    <span className="truncate text-body-2-medium text-text-secondary">
                      {hire.joined}
                    </span>
                  </div>
                </div>
                <div className="flex h-6 w-full items-center justify-center rounded-md bg-background-secondary-default px-1.5">
                  <span className="text-caption-1-medium text-text-secondary">{hire.role}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="small" leadingIcon={RiArrowLeftSLine} className="flex-1">
          Previous
        </Button>
        <Button
          variant="secondary"
          size="small"
          trailingIcon={RiArrowRightSLine}
          className="flex-1"
        >
          Next
        </Button>
      </div>
    </section>
  );
}

/* ---------- Earned so far (bar chart) ------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EARNED_BARS = [50.49, 115.63, 150.38, 111.11, 57.19, 35.84, 59.53, 78.54, 106.59, 70.75, 179.52, 127.94];

/* ---------- Revenue (line chart) ----------------------------------------- */

const REVENUE_LINE =
  "M0 129.54599c14.606-5.11399 29.212-10.22799 43.818-17.046 14.606-6.81801 29.212-23.863 43.818-23.863 14.606 0 29.21201 10.227 43.819 10.227 14.606 0 29.21201-37.5 43.81801-37.5 14.606 0 29.21201 6.25 43.81799 10.227 14.60599 3.977 29.21201 13.637 43.818 13.637 14.60598 0 29.212-26.705 43.81799-37.5 14.60599-10.795 29.21201-27.273 43.81799-27.273 14.607 0 29.21302 7.954 43.819 13.636 14.60599 5.682 29.21201 20.455 43.818 20.455 14.60598 0 29.21203-27.27299 43.81802-54.54599";

function RevenueChart() {
  const [range, setRange] = useState("Weekly");
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 rounded-2xl bg-background-secondary-default p-4 pb-3">
      <MetricHead
        label="Revenue"
        value="$18,240"
        delta="+9.4%"
        deltaTone="up"
        right={<PillSegmented options={["Weekly", "Monthly", "Yearly"]} value={range} onChange={setRange} />}
      />
      <svg viewBox="0 0 532 229" className="h-auto w-full shrink-0">
        <g transform="translate(44 21.727)">
          <path
            d={REVENUE_LINE}
            fill="none"
            stroke="#7ccf00"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <g fill="#a1a1a1" fontFamily="Inter, system-ui, sans-serif" fontSize={12}>
          <text x={0} y={13}>$6K</text>
          <text x={0} y={67}>$4K</text>
          <text x={0} y={135}>$2K</text>
          <text x={0} y={203}>$0</text>
        </g>
        <g fill="#a1a1a1" fontFamily="Inter, system-ui, sans-serif" fontSize={13}>
          {MONTHS.map((month, i) => (
            <text key={month} x={44 + i * 43.5} y={221}>
              {month}
            </text>
          ))}
        </g>
      </svg>
    </section>
  );
}

/* ---------- Contributions + activity heatmap ------------------------------ */

const HEAT_COLORS = ["#d4d4d4", "#ddd6ff", "#a684ff", "#8e51ff", "#7f22fe", "#7008e7"];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function heatTier(r: number) {
  if (r < 0.3) return 0;
  if (r < 0.68) return 1;
  if (r < 0.84) return 2;
  if (r < 0.93) return 3;
  if (r < 0.97) return 4;
  return 5;
}

const CONTRIBUTION_STATS = [
  { value: "9B", label: "Lifetime tokens" },
  { value: "562.7M", label: "Peak tokens" },
  { value: "12h 54m", label: "Longest task" },
  { value: "62 days", label: "Top streak" },
];

function ContributionsCard() {
  const [range, setRange] = useState("Weekly");
  const grid = useMemo(() => {
    const rand = mulberry32(1337);
    return Array.from({ length: 7 }, () =>
      Array.from({ length: 38 }, () => heatTier(rand())),
    );
  }, []);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden rounded-2xl bg-background-secondary-default px-2 py-4">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full flex-col gap-0.5 px-2">
          <span className="text-body-medium text-text-secondary">Contributions this year</span>
          <div className="flex h-8.5 items-center gap-2">
            <span className="text-title-1-medium text-text-primary">958</span>
            <DeltaBadge value="+14.8%" tone="up" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {CONTRIBUTION_STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-1 flex-col rounded-2lg bg-background-primary-default p-2.5 shadow-card"
          >
            <span className="text-body-medium text-text-primary">{stat.value}</span>
            <span className="truncate text-body-medium text-text-secondary">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="flex w-full flex-col gap-1 px-2">
          <div className="flex items-center justify-between">
            <span className="text-body-medium text-text-secondary">Activity</span>
            <TextSegmented
              options={["Weekly", "Monthly", "Yearly"]}
              value={range}
              onChange={setRange}
            />
          </div>
          <div className="flex flex-col gap-1">
            {grid.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((tier, c) => (
                  <div
                    key={c}
                    className="h-2.5 flex-1 rounded-[3px]"
                    style={{ backgroundColor: HEAT_COLORS[tier] }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-body-2-medium text-text-tertiary">
            {MONTHS.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Customers stat cards ----------------------------------------- */

const CUSTOMER_STATS = [
  {
    icon: RiGroupLine,
    label: "Customers",
    value: "14,592",
    delta: "+5.3%",
    deltaTone: "up" as const,
  },
  {
    icon: RiBox3Line,
    label: "Unit sold",
    value: "385",
    delta: "-2.1%",
    deltaTone: "down" as const,
  },
  {
    icon: RiShoppingBag3Line,
    label: "Orders",
    value: "1,394",
    delta: "0.00%",
    deltaTone: "flat" as const,
  },
  {
    icon: RiMessage2Line,
    label: "Support tickets",
    value: "708",
    delta: "+12.8%",
    deltaTone: "up" as const,
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaTone,
}: (typeof CUSTOMER_STATS)[number]) {
  return (
    <section className="flex h-[132px] min-w-0 flex-1 flex-col justify-between rounded-2xl bg-background-secondary-default p-4">
      <span className="flex w-fit items-center rounded-md bg-background-primary-default p-1.5">
        <Icon className="size-5 text-text-primary" aria-hidden />
      </span>
      <div className="flex h-14 flex-col gap-0.5">
        <span className="text-body-medium text-text-secondary">{label}</span>
        <div className="flex h-8.5 items-center gap-2">
          <span className="text-title-1-medium text-text-primary">{value}</span>
          <DeltaBadge value={delta} tone={deltaTone} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------------------------------------------------------- */

export function DashboardHome() {
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2">
        <PageHeader />
        <div className="flex items-end justify-between gap-2">
          <div className="flex h-6.5 items-center px-1">
            <span className="text-title-2-medium text-text-primary">Welcome Owner Admin</span>
          </div>
          <HeaderActions />
        </div>
      </header>

      <div className="flex gap-4">
        <RecentHiresCard />
        <BarChartCard
          title="Earned so far"
          value="$7,462"
          delta="+14.8%"
          deltaTone="up"
          bars={EARNED_BARS}
          yLabels={["$10K", "$5K", "$3K", "$0"]}
          className="w-[673px] max-w-full shrink-0"
        />
      </div>

      <div className="flex gap-4">
        <RevenueChart />
        <ContributionsCard />
      </div>

      <div className="flex gap-4">
        {CUSTOMER_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <CustomersTable />
    </div>
  );
}
