'use client'

import { useState } from 'react'

export function MonthlyView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  function prev() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {year}年{month}月
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            ＜ 前月
          </button>
          <button
            onClick={next}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            次月 ＞
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-pink p-6">
        {/* TODO: 月間カレンダーグリッド + 計画一覧を実装 */}
        <p className="text-center text-gray-400 py-16 text-sm">
          月間カレンダーを実装予定
        </p>
      </div>
    </div>
  )
}
