import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/application/dashboard/app-layout'
import { PenjualanHome } from '@/components/application/dashboard/penjualan-home'
import { parseSalesSearch } from '@/features/sales/sales-demo'

export const Route = createFileRoute('/_protected/penjualan')({
  component: Penjualan,
  validateSearch: parseSalesSearch,
})

function Penjualan() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <AppLayout>
      <PenjualanHome
        search={search}
        onSearch={(patch, replace) => {
          void navigate({
            search: (previous) => ({ ...previous, page: 1, ...patch }),
            replace,
            resetScroll: false,
          });
        }}
      />
    </AppLayout>
  )
}
