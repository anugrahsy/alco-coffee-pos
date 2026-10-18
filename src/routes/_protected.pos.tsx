import { createFileRoute } from '@tanstack/react-router'
import { PosLayout } from '@/components/application/pos/pos-layout'

type PosSearch = {
  view?: 'simpan-pesanan' | 'monitor' | 'penjualan' | 'promo'
}

const VIEWS = ['simpan-pesanan', 'monitor', 'penjualan', 'promo'] as const;

export const Route = createFileRoute('/_protected/pos')({
  component: Pos,
  validateSearch: (search: Record<string, unknown>): PosSearch => ({
    view: VIEWS.includes(search.view as (typeof VIEWS)[number])
      ? (search.view as PosSearch['view'])
      : undefined,
  }),
})

function Pos() {
  return <PosLayout />
}
