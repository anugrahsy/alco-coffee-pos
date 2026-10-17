import { createFileRoute } from '@tanstack/react-router'
import { PosLayout } from '@/components/application/pos/pos-layout'

export const Route = createFileRoute('/_protected/pos')({
  component: Pos,
})

function Pos() {
  return <PosLayout />
}
