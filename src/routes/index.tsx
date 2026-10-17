import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // TODO: redirect berdasar role — admin → /dashboard, cashier → /pos.
    throw redirect({ to: '/pos' })
  },
})
