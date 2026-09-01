import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import { PwaRegister } from '../components/pwa-register'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: 'Desfralde — Vivências Azuis' },
      {
        name: 'description',
        content:
          'PECS para o vaso: a criança mostra o cartão, ouve a palavra e a casa anota a hora.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Desfralde — Vivências Azuis' },
      {
        property: 'og:description',
        content:
          'PECS para o vaso: a criança mostra o cartão, ouve a palavra e a casa anota a hora.',
      },
      { property: 'og:image', content: '/og.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Desfralde — Vivências Azuis' },
      {
        name: 'twitter:description',
        content:
          'PECS para o vaso: a criança mostra o cartão, ouve a palavra e a casa anota a hora.',
      },
      { name: 'twitter:image', content: '/og.png' },
      { name: 'theme-color', content: '#c45c3e' },
      { name: 'application-name', content: 'Desfralde' },
      { name: 'apple-mobile-web-app-title', content: 'Desfralde' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'mobile-web-app-capable', content: 'yes' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      {
        rel: 'icon',
        href: '/favicon-32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        href: '/favicon-16.png',
        type: 'image/png',
        sizes: '16x16',
      },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Baloo+2:wght@600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full bg-[#f3ead6] font-body text-[#2a2118]">
        {children}
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  )
}
