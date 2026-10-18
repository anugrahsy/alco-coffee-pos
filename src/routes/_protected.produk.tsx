import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { ProdukHome } from '@/components/application/dashboard/produk-home'
import { parseCatalogSearch } from '@/features/catalog/catalog-search'

export const Route = createFileRoute('/_protected/produk')({
  component: Produk,
  validateSearch: parseCatalogSearch,
})

function Produk() {
  return (
    <AppLayout>
      <ProdukHome />
    </AppLayout>
  )
}
