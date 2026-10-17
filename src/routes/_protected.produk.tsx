import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { ProdukHome } from '@/components/application/dashboard/produk-home'

export const Route = createFileRoute('/_protected/produk')({
  component: Produk,
})

function Produk() {
  return (
    <AppLayout>
      <ProdukHome />
    </AppLayout>
  )
}
