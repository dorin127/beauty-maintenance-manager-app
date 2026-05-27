'use client'

import { useState } from 'react'
import type { MaintenancePlan } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { completePlan, skipPlan, deletePlan, deleteSeriesPlanned } from '@/lib/planActions'

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
  const [showDelete, setShowDelete] = useState(false)

  if (!plan) return null

  const formatted = plan.planned_date.replace(/-/g, '/')

  async function run(action: () => Promise<void>) {
    setLoading(true)
    setErr(null)
    try {
      await action()
      onUpdated()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : '不明なエラー')
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
        {/* タイトル */}
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

        {/* 計画中の場合：操作ボタン */}
        {plan.status === 'planned' && (
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
              onClick={() => run(() => completePlan(plan, completedDate))}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? '更新中...' : '実施済みにする'}
            </button>
            <button
              onClick={() => run(() => skipPlan(plan.id))}
              disabled={loading}
              className="w-full border border-gray-200 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              スキップする
            </button>
          </div>
        )}

        {/* 実施済み・スキップの場合 */}
        {plan.status !== 'planned' && (
          <div className="text-center text-sm text-gray-400 py-2">
            {plan.status === 'completed'
              ? `実施日：${plan.completed_date?.replace(/-/g, '/')}`
              : 'スキップ済み'}
          </div>
        )}

        {/* 削除セクション */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              削除する...
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center mb-2">削除方法を選んでください</p>
              <button
                onClick={() => run(() => deletePlan(plan.id))}
                disabled={loading}
                className="w-full border border-red-200 text-red-500 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                この計画だけ削除
              </button>
              <button
                onClick={() => run(() => deleteSeriesPlanned(plan.series_id, plan.planned_date))}
                disabled={loading}
                className="w-full border border-red-200 text-red-500 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                以降の計画をすべて削除
                <span className="block text-xs font-normal text-gray-400">実施済みの記録は残ります</span>
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="w-full text-xs text-gray-400"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
