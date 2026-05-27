import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import './globals.css'

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
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-surface font-sans">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
