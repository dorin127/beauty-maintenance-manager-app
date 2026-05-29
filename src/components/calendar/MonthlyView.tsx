'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMonthlyPlans, useUnpricedPlans } from '@/hooks/usePlans'
import { CalendarGrid } from './CalendarGrid'
import { PlanModal } from '@/components/maintenance/PlanModal'
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
  const { plans, loading, refetch }             = useMonthlyPlans(year, month)
  const { plans: unpricedPlans, refetch: refetchUnpriced } = useUnpricedPlans()

  function go(y: number, m: number) {
    router.push(`/monthly?year=${y}&month=${m}`)
  }


  const counts = {
    planned:   plans.filter(p => p.status === 'planned').length,
    reserved:  plans.filter(p => p.status === 'reserved').length,
    completed: plans.filter(p => p.status === 'completed').length,
    skipped:   plans.filter(p => p.status === 'skipped').length,
  }

  const totalAmount = plans
    .filter(p => p.status === 'completed' && p.amount != null)
    .reduce((sum, p) => sum + p.amount!, 0)

  return (
    <>
      <div className="max-w-5xl mx-auto py-8 px-6">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">{year}年{month}月</h2>
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
              />
            </>
          )}
        </div>

        {/* 凡例 */}
        <div className="mt-3 px-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['planned', 'reserved', 'completed', 'skipped'] as const).map(s => (
                <StatusBadge key={s} status={s} count={counts[s]} />
              ))}
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
          {counts.completed > 0 && (
            <p className="text-sm text-gray-600">
              今月の実施合計：
              <span className="font-semibold text-primary">
                ¥{totalAmount.toLocaleString()}
              </span>
            </p>
          )}
          {unpricedPlans.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700 font-medium mb-1.5">金額が未入力の施術があります。タップして入力してください。</p>
              <div className="flex flex-wrap gap-1.5">
                {unpricedPlans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className="text-xs bg-white border border-amber-300 text-amber-800 rounded-full px-2.5 py-0.5 hover:bg-amber-100 transition-colors"
                  >
                    {p.menu_name}（{p.planned_date.slice(5).replace('-', '/')}）
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      <PlanModal
        key={selectedPlan?.id}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onUpdated={() => { refetch(); refetchUnpriced() }}
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
