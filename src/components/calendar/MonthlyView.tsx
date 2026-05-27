'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMonthlyPlans } from '@/hooks/usePlans'
import { CalendarGrid } from './CalendarGrid'
import { PlanModal } from '@/components/maintenance/PlanModal'
import type { MaintenancePlan } from '@/lib/types'

export function MonthlyView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const now = new Date()

  const year  = parseInt(searchParams.get('year')  ?? '') || now.getFullYear()
  const month = parseInt(searchParams.get('month') ?? '') || now.getMonth() + 1

  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null)
  const { plans, loading, refetch } = useMonthlyPlans(year, month)

  function go(y: number, m: number) {
    router.push(`/monthly?year=${y}&month=${m}`)
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
              onClick={() => month === 1 ? go(year - 1, 12) : go(year, month - 1)}
              className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
            >
              ＜ 前月
            </button>
            <button
              onClick={() => go(now.getFullYear(), now.getMonth() + 1)}
              className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
            >
              今月
            </button>
            <button
              onClick={() => month === 12 ? go(year + 1, 1) : go(year, month + 1)}
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
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-3">この月の計画はまだありません</p>
              <Link
                href="/input"
                className="inline-block bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
              >
                ＋ 計画を追加する
              </Link>
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
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-4">
            {[
              { color: 'bg-primary-light border-primary/30', label: '計画中' },
              { color: 'bg-green-50 border-green-200', label: '実施済' },
              { color: 'bg-gray-100 border-gray-200', label: 'スキップ' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-3 h-3 rounded border inline-block ${color}`} />
                {label}
              </div>
            ))}
          </div>
          {plans.length > 0 && (
            <Link href="/input" className="text-xs text-primary hover:underline">
              ＋ 計画を追加
            </Link>
          )}
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
