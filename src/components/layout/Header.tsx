'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/input',   label: '入力' },
  { href: '/monthly', label: '月間' },
  { href: '/annual',  label: '年間' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-border-pink sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/monthly" className="text-xl font-bold text-primary tracking-wide">
          美容メンテ マネージャー
        </Link>
        <nav className="flex gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:text-primary hover:bg-primary-light'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
