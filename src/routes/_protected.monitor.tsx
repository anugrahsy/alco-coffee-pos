import { createFileRoute } from '@tanstack/react-router'
import {
  RiCoinsFill,
  RiDashboardLine,
  RiLineChartFill,
  RiReceiptLine,
  RiShoppingBasket2Fill,
} from '@remixicon/react'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { BarChartCard } from '@/components/application/dashboard/bar-chart-card'
import {
  BestSellersCard,
  CategoryDonutCard,
  PaymentDonutCard,
} from '@/components/application/dashboard/monitor-charts'
import { PageHeader } from '@/components/application/dashboard/page-header'
import {
  RevenueChartCard,
  type RevenuePoint,
} from '@/components/application/dashboard/revenue-chart-card'
import { StatCards, type Stat } from '@/components/application/dashboard/stat-cards'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/base/segmented-control/segmented-control'

const STATS: Stat[] = [
  {
    icon: RiCoinsFill,
    label: 'Pendapatan penjualan',
    value: 'Rp 56.800.000',
    delta: '+6.8%',
    deltaColor: 'lime',
    tone: 'blue',
    caption: 'bulan ini',
  },
  {
    icon: RiShoppingBasket2Fill,
    label: 'Estimasi laba kotor',
    value: 'Rp 24.710.000',
    delta: '+5.2%',
    deltaColor: 'lime',
    tone: 'orange',
    caption: 'bulan ini',
  },
  {
    icon: RiLineChartFill,
    label: 'Estimasi laba bersih',
    value: 'Rp 19.460.000',
    delta: '+3.9%',
    deltaColor: 'lime',
    tone: 'purple',
    caption: 'bulan ini',
  },
  {
    icon: RiReceiptLine,
    label: 'Rata-rata tagihan',
    value: 'Rp 23.600',
    delta: '2.410 order',
    deltaColor: 'neutral',
    tone: 'pink',
    caption: 'bulan ini',
  },
]

const REVENUE_RUPIAH: RevenuePoint[] = [
  { label: 'Jan', current: 4_100_000, previous: 3_700_000 },
  { label: 'Feb', current: 4_250_000, previous: 3_800_000 },
  { label: 'Mar', current: 4_500_000, previous: 4_100_000 },
  { label: 'Apr', current: 4_400_000, previous: 4_200_000 },
  { label: 'May', current: 4_800_000, previous: 4_400_000 },
  { label: 'Jun', current: 5_100_000, previous: 4_600_000 },
  { label: 'Jul', current: 5_400_000, previous: 4_800_000 },
  { label: 'Aug', current: 5_200_000, previous: 4_900_000 },
  { label: 'Sep', current: 5_600_000, previous: 5_000_000 },
  { label: 'Oct', current: 5_800_000, previous: 5_200_000 },
  { label: 'Nov', current: 5_500_000, previous: 5_000_000 },
  { label: 'Dec', current: 6_150_000, previous: 5_300_000 },
]

const ORDER_BARS = [40, 90, 120, 90, 45, 28, 48, 62, 85, 55, 145, 100]

export const Route = createFileRoute('/_protected/monitor')({
  component: Monitor,
})

function Monitor() {
  return (
    <AppLayout>
      <div className="flex w-full flex-col gap-4">
        <PageHeader current="Monitor" icon={RiDashboardLine} />

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 px-1">
            <span className="text-title-2-medium text-text-primary">Monitor</span>
            <span className="text-body-medium text-text-secondary">
              Ringkasan performa toko bulan ini
            </span>
          </div>
          <SegmentedControl defaultSelectedKeys={['weekly']}>
            <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
            <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem id="yearly">Yearly</SegmentedControlItem>
          </SegmentedControl>
        </div>

        <StatCards variant="footer" stats={STATS} />

        <div className="flex gap-4">
          <RevenueChartCard
            title="Pendapatan"
            currency="Rp "
            locale="id-ID"
            data={REVENUE_RUPIAH}
          />
          <BarChartCard
            title="Jumlah orderan"
            value="2.410"
            delta="+8.4%"
            bars={ORDER_BARS}
            yLabels={['1.500', '1.000', '500', '0']}
            className="h-[344px]"
          />
        </div>

        <div className="flex flex-col gap-0.5 px-1">
          <span className="text-title-2-medium text-text-primary">Monitoring Produk</span>
          <span className="text-body-medium text-text-secondary">Detail transaksi produk</span>
        </div>

        <div className="flex gap-4">
          <BestSellersCard />
          <CategoryDonutCard />
          <PaymentDonutCard />
        </div>
      </div>
    </AppLayout>
  )
}
