import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { KategoriHome } from '@/components/application/dashboard/kategori-home'

export const Route = createFileRoute('/_protected/kategori')({
  component: Kategori,
})

function Kategori() {
  return (
    <AppLayout>
      <KategoriHome />
    </AppLayout>
  )
}
