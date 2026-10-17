import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  // TODO: auth guard — redirect ke /login bila belum login.
  return <Outlet />
}
