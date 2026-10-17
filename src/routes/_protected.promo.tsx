import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { PromoHome } from '@/components/application/dashboard/promo-home'

export const Route = createFileRoute('/_protected/promo')({
  component: Promo,
})

function Promo() {
  return (
    <AppLayout>
      <PromoHome />
    </AppLayout>
  )
}
