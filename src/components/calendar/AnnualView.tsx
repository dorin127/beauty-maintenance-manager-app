'use client'

import { useState } from 'react'

export function AnnualView() {
  const [year, setYear] = useState(new Date().getFullYear())

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">{year}年 年間計画</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setYear(y => y - 1)}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            ＜ 前年
          </button>
          <button
            onClick={() => setYear(y => y + 1)}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            次年 ＞
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <div key={m} className="bg-white rounded-xl border border-border-pink p-4">
            <p className="font-medium text-primary mb-2">{m}月</p>
            {/* TODO: 月ごとの計画サマリーを表示 */}
            <p className="text-xs text-gray-400">計画なし</p>
          </div>
        ))}
      </div>
    </div>
  )
}
