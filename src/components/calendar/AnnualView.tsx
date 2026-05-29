'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAnnualPlans } from '@/hooks/usePlans'
import { StatusBadge } from '@/components/maintenance/StatusBadge'
import type { MaintenancePlan } from '@/lib/types'

function groupByMonth(plans: MaintenancePlan[]): Record<number, MaintenancePlan[]> {
  return plans.reduce<Record<number, MaintenancePlan[]>>((acc, plan) => {
    const m = parseInt(plan.planned_date.split('-')[1])
    if (!acc[m]) acc[m] = []
    acc[m].push(plan)
    return acc
  }, {})
}

export function AnnualView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const now = new Date()

  const year = parseInt(searchParams.get('year') ?? '') || now.getFullYear()
  const { plans, loading } = useAnnualPlans(year)

  const byMonth      = groupByMonth(plans)
  const totalPlanned = plans.filter(p => p.status === 'planned').length
  const totalDone    = plans.filter(p => p.status === 'completed').length
  const totalAmount  = plans
    .filter(p => p.status === 'completed' && p.amount != null)
    .reduce((sum, p) => sum + p.amount!, 0)

  function go(y: number) {
    router.push(`/annual?year=${y}`)
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">{year}年 サマリー</h2>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              計画中 {totalPlanned}件 / 実施済 {totalDone}件
              {totalDone > 0 && (
                <span className="ml-2 font-semibold text-primary">
                  合計 ¥{totalAmount.toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => go(year - 1)}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            ＜ 前年
          </button>
          <button
            onClick={() => go(now.getFullYear())}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            今年
          </button>
          <button
            onClick={() => go(year + 1)}
            className="px-4 py-2 border border-border-pink rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            次年 ＞
          </button>
        </div>
      </div>

      {/* 12ヶ月グリッド */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
          const monthPlans    = byMonth[m] ?? []
          const isCurrentMonth = year === now.getFullYear() && m === now.getMonth() + 1
          const isPast         = year < now.getFullYear() || (year === now.getFullYear() && m < now.getMonth() + 1)
          const monthAmount    = monthPlans
            .filter(p => p.status === 'completed' && p.amount != null)
            .reduce((sum, p) => sum + p.amount!, 0)
          const hasCompleted   = monthPlans.some(p => p.status === 'completed')

          return (
            <Link
              key={m}
              href={`/monthly?year=${year}&month=${m}`}
              className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow block ${
                isCurrentMonth ? 'border-primary border-2' : 'border-border-pink'
              } ${isPast && !isCurrentMonth ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`font-semibold ${isCurrentMonth ? 'text-primary' : 'text-gray-700'}`}>
                  {m}月
                </p>
                <div className="text-right">
                  {monthPlans.length > 0 && (
                    <span className="text-xs text-gray-400">{monthPlans.length}件</span>
                  )}
                  {hasCompleted && (
                    <p className="text-xs font-medium text-primary">¥{monthAmount.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                </div>
              ) : monthPlans.length === 0 ? (
                <p className="text-xs text-gray-300">予定なし</p>
              ) : (
                <div className="space-y-1.5">
                  {monthPlans.slice(0, 4).map(plan => (
                    <div key={plan.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 truncate">{plan.menu_name}</span>
                      <StatusBadge status={plan.status} />
                    </div>
                  ))}
                  {monthPlans.length > 4 && (
                    <p className="text-xs text-gray-400">他 {monthPlans.length - 4}件</p>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* 空状態 */}
      {!loading && plans.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 mb-3">この年の計画はまだありません</p>
          <Link
            href="/input"
            className="inline-block bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            ＋ 計画を追加する
          </Link>
        </div>
      )}
    </div>
  )
}
