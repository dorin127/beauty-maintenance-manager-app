'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMonthlyPlans } from '@/hooks/usePlans'
import { useMenus } from '@/hooks/useMenus'
import { CalendarGrid } from './CalendarGrid'
import { PlanModal } from '@/components/maintenance/PlanModal'
import { PlanCard } from '@/components/maintenance/PlanCard'
import { MaintenanceForm } from '@/components/forms/MaintenanceForm'
import { MenuManageModal } from '@/components/maintenance/MenuManageModal'
import { ClinicManageModal } from '@/components/maintenance/ClinicManageModal'
import { StatusBadge } from '@/components/maintenance/StatusBadge'
import type { MaintenancePlan } from '@/lib/types'

export function MonthlyView() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const now          = new Date()

  const year  = parseInt(searchParams.get('year')  ?? '') || now.getFullYear()
  const month = parseInt(searchParams.get('month') ?? '') || now.getMonth() + 1

  const [selectedPlan, setSelectedPlan]         = useState<MaintenancePlan | null>(null)
  const [inputDate, setInputDate]               = useState<string | null>(null)
  const [showMenuManage, setShowMenuManage]     = useState(false)
  const [showClinicManage, setShowClinicManage] = useState(false)
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
          ) : (
            <>
              {plans.length === 0 && (
                <p className="text-center text-xs text-gray-400 mb-2">
                  日付をクリックして計画を追加できます
                </p>
              )}
              <CalendarGrid
                year={year}
                month={month}
                plans={plans}
                onPlanClick={setSelectedPlan}
                onDayClick={setInputDate}
                conflictDays={conflictDays}
              />
            </>
          )}
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-2 flex-wrap">
            {(['planned', 'reserved', 'completed', 'skipped'] as const).map(s => (
              <StatusBadge key={s} status={s} />
            ))}
            {conflictDays.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-amber-600 bg-amber-50">
                ⚠ 禁止処理の競合
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMenuManage(true)}
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              メニュー管理 ›
            </button>
            <button
              onClick={() => setShowClinicManage(true)}
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              クリニック管理 ›
            </button>
          </div>
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

      {showMenuManage && (
        <MenuManageModal onClose={() => setShowMenuManage(false)} />
      )}

      {showClinicManage && (
        <ClinicManageModal onClose={() => setShowClinicManage(false)} />
      )}

      {inputDate && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setInputDate(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-lg font-bold text-gray-800">計画を追加</h3>
              <button
                onClick={() => setInputDate(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pb-6">
              <MaintenanceForm
                key={inputDate}
                initialDate={inputDate}
                onSuccess={() => { setInputDate(null); refetch() }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
