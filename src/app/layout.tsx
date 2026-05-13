import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400','500','600','700','800']
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
  weight: ['300','400','500','600']
})

export const metadata: Metadata = {
  title: 'PilotoFinanceiro',
  description: 'Gestão financeira para motoristas de aplicativo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PilotoFinanceiro'
  },
}

export const viewport: Viewport = {
  themeColor: '#00FF87',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmSans.variable}`}>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-dm, DM Sans), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
