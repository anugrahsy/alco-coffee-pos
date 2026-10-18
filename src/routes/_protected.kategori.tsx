import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { KategoriHome } from '@/components/application/dashboard/kategori-home'
import { parseCatalogSearch } from '@/features/catalog/catalog-search'

export const Route = createFileRoute('/_protected/kategori')({
  component: Kategori,
  validateSearch: parseCatalogSearch,
})

function Kategori() {
  return (
    <AppLayout>
      <KategoriHome />
    </AppLayout>
  )
}
