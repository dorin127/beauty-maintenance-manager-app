'use client'

import { useState } from 'react'
import type { MaintenancePlan } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { completePlan, skipPlan } from '@/lib/planActions'

interface Props {
  plan: MaintenancePlan | null
  onClose: () => void
  onUpdated: () => void
}

export function PlanModal({ plan, onClose, onUpdated }: Props) {
  const today = new Date().toLocaleDateString('sv-SE')
  const [completedDate, setCompletedDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!plan) return null

  const formatted = plan.planned_date.replace(/-/g, '/')

  async function handleComplete() {
    setLoading(true)
    setErr(null)
    try {
      await completePlan(plan!, completedDate)
      onUpdated()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  async function handleSkip() {
    setLoading(true)
    setErr(null)
    try {
      await skipPlan(plan!.id)
      onUpdated()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-border-pink p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{plan.menu_name}</h3>
            <p className="text-sm text-gray-500">予定日：{formatted}</p>
            <p className="text-xs text-gray-400">{plan.interval_months}ヶ月ごと</p>
          </div>
          <StatusBadge status={plan.status} />
        </div>

        {plan.notes && (
          <p className="text-sm text-gray-500 mb-4 bg-surface rounded-lg px-3 py-2">
            {plan.notes}
          </p>
        )}

        {err && (
          <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">{err}</p>
        )}

        {plan.status === 'planned' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">実施日</label>
              <input
                type="date"
                value={completedDate}
                onChange={e => setCompletedDate(e.target.value)}
                className="w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                次回予定は実施日 + {plan.interval_months}ヶ月で自動更新されます
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? '更新中...' : '実施済みにする'}
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full border border-gray-200 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              スキップする
            </button>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 py-2">
            {plan.status === 'completed'
              ? `実施日：${plan.completed_date?.replace(/-/g, '/')}`
              : 'スキップ済み'}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
