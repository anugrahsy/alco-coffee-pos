import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { DirectionProvider } from '@/components/foundations/direction/direction'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const AppDevtools = import.meta.env.DEV && import.meta.env.VITE_DEVTOOLS === 'true'
  ? lazy(() => import('../integrations/tanstack-query/app-devtools'))
  : null

export const Route = createRootRouteWithContext<MyRouterContext>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Coffee POS',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body>
        <DirectionProvider locale="id">{children}</DirectionProvider>
        {AppDevtools && <Suspense fallback={null}><AppDevtools /></Suspense>}
        <Scripts />
      </body>
    </html>
  )
}
