import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {themeInitScript} from '@/lib/theme-script'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const siteUrl = 'https://litelink-seven.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LiteLink: see what a page actually costs to load',
  description:
    'Compare a page in full against a stripped, ad- and tracker-free version, with an estimated data cost for each.',
  keywords: ['page weight', 'web performance', 'data cost', 'lite browsing', 'low bandwidth'],
  openGraph: {
    title: 'LiteLink: see what a page actually costs to load',
    description:
      'Compare a page in full against a stripped, ad- and tracker-free version, with an estimated data cost for each.',
    url: siteUrl,
    siteName: 'LiteLink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiteLink: see what a page actually costs to load',
    description:
      'Compare a page in full against a stripped, ad- and tracker-free version, with an estimated data cost for each.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
