import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SMS Sender',
  icons: {
    icon: [
      {
        url: 'favicon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'favicon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'favicon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}