'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMonthlyPlans } from '@/hooks/usePlans'
import { useMenus } from '@/hooks/useMenus'
import { CalendarGrid } from './CalendarGrid'
import { PlanModal } from '@/components/maintenance/PlanModal'
import { PlanCard } from '@/components/maintenance/PlanCard'
import type { MaintenancePlan } from '@/lib/types'

export function MonthlyView() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const now          = new Date()

  const year  = parseInt(searchParams.get('year')  ?? '') || now.getFullYear()
  const month = parseInt(searchParams.get('month') ?? '') || now.getMonth() + 1

  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null)
  const { plans, loading, refetch } = useMonthlyPlans(year, month)
  const { menus }                   = useMenus()

  function go(y: number, m: number) {
    router.push(`/monthly?year=${y}&month=${m}`)
  }

  // 同日に禁止処理の組み合わせがある日をセットで返す
  const conflictDays = useMemo(() => {
    const result = new Set<number>()
    const plansByDay = plans.reduce<Record<number, MaintenancePlan[]>>((acc, plan) => {
      const day = parseInt(plan.planned_date.split('-')[2])
      ;(acc[day] ??= []).push(plan)
      return acc
    }, {})

    for (const [dayStr, dayPlans] of Object.entries(plansByDay)) {
      for (const plan of dayPlans) {
        const menu = menus.find(m => m.id === plan.menu_id || m.name === plan.menu_name)
        if (!menu?.prohibited_with.length) continue
        const otherNames = dayPlans.filter(p => p.id !== plan.id).map(p => p.menu_name)
        if (menu.prohibited_with.some(p => otherNames.includes(p))) {
          result.add(parseInt(dayStr))
        }
      }
    }
    return result
  }, [plans, menus])

  const planned   = plans.filter(p => p.status === 'planned').length
  const completed = plans.filter(p => p.status === 'completed').length
  const sorted    = [...plans].sort((a, b) => a.planned_date.localeCompare(b.planned_date))

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
                {conflictDays.size > 0 && (
                  <span className="ml-2 text-amber-500 font-medium">
                    ⚠ 禁止処理の競合あり
                  </span>
                )}
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
              conflictDays={conflictDays}
            />
          )}
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-4">
            {[
              { color: 'bg-rose-50 border-rose-300',  label: '計画中' },
              { color: 'bg-rose-400 border-rose-400', label: '実施済' },
              { color: 'bg-gray-100 border-gray-200', label: 'スキップ' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-3 h-3 rounded border inline-block ${color}`} />
                {label}
              </div>
            ))}
            {conflictDays.size > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <span>⚠</span>
                <span>禁止処理の競合</span>
              </div>
            )}
          </div>
          {plans.length > 0 && (
            <Link href="/input" className="text-xs text-primary hover:underline">
              ＋ 計画を追加
            </Link>
          )}
        </div>

        {/* この月の計画一覧 */}
        {plans.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">この月の計画一覧</h3>
            <div className="space-y-2">
              {sorted.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onClick={() => setSelectedPlan(plan)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <PlanModal
        key={selectedPlan?.id}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onUpdated={refetch}
      />
    </>
  )
}
