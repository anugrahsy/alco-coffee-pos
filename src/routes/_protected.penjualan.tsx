import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { PenjualanHome } from '@/components/application/dashboard/penjualan-home'

export const Route = createFileRoute('/_protected/penjualan')({
  component: Penjualan,
})

function Penjualan() {
  return (
    <AppLayout>
      <PenjualanHome />
    </AppLayout>
  )
}
