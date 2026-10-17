import { createFileRoute } from '@tanstack/react-router'
import { DashboardHome } from '@/components/application/dashboard/dashboard-home'
import { AppLayout } from '@/components/application/dashboard/app-layout'

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <AppLayout>
      <DashboardHome />
    </AppLayout>
  )
}
