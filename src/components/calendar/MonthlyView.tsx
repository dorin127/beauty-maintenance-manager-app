'use client'

import { useState } from 'react'
import { useMonthlyPlans } from '@/hooks/usePlans'
import { CalendarGrid } from './CalendarGrid'
import { PlanModal } from '@/components/maintenance/PlanModal'
import type { MaintenancePlan } from '@/lib/types'

export function MonthlyView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null)

  const { plans, loading, refetch } = useMonthlyPlans(year, month)

  function prev() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const planned   = plans.filter(p => p.status === 'planned').length
  const completed = plans.filter(p => p.status === 'completed').length

  return (
    <>
      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">{year}年{month}月</h2>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">
                計画中 {planned}件 / 実施済 {completed}件
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
            >
              ＜ 前月
            </button>
            <button
              onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }}
              className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
            >
              今月
            </button>
            <button
              onClick={next}
              className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
            >
              次月 ＞
            </button>
          </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-surface rounded-2xl p-4">
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-[88px] bg-white rounded-lg animate-pulse border border-border-pink" />
              ))}
            </div>
          ) : (
            <CalendarGrid
              year={year}
              month={month}
              plans={plans}
              onPlanClick={setSelectedPlan}
            />
          )}
        </div>

        {/* 凡例 */}
        <div className="flex gap-4 mt-3 px-1">
          {[
            { color: 'bg-primary-light border-primary/30 text-primary', label: '計画中' },
            { color: 'bg-green-50 border-green-200 text-green-700', label: '実施済' },
            { color: 'bg-gray-100 border-gray-200 text-gray-400', label: 'スキップ' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-3 h-3 rounded border inline-block ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <PlanModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onUpdated={refetch}
      />
    </>
  )
}
