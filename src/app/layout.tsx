import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '美容メンテ マネージャー',
  description: '美容メンテナンスの計画・管理アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-surface font-sans">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
