import { createFileRoute } from '@tanstack/react-router'
import { PosLayout } from '@/components/application/pos/pos-layout'

type PosSearch = {
  view?: 'simpan-pesanan'
}

export const Route = createFileRoute('/_protected/pos')({
  component: Pos,
  validateSearch: (search: Record<string, unknown>): PosSearch => ({
    view: search.view === 'simpan-pesanan' ? 'simpan-pesanan' : undefined,
  }),
})

function Pos() {
  return <PosLayout />
}
