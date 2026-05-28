'use client'

import { useState } from 'react'
import type { MaintenancePlan } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { useClinics } from '@/hooks/useClinics'
import {
  completePlan,
  reservePlan,
  cancelReservation,
  skipPlan,
  updatePlanDate,
  updateAmount,
  deletePlan,
  deleteSeriesPlanned,
} from '@/lib/planActions'

type Section = null | 'reserve' | 'editDate' | 'delete' | 'weekdayChoice'

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']
function weekdayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return WEEKDAY_JA[new Date(y, m - 1, d).getDay()] + '曜'
}

interface Props {
  plan: MaintenancePlan | null
  onClose: () => void
  onUpdated: () => void
}

export function PlanModal({ plan, onClose, onUpdated }: Props) {
  const [completedDate, setCompletedDate] = useState(plan?.planned_date ?? new Date().toLocaleDateString('sv-SE'))
  const [amountStr, setAmountStr]         = useState(plan?.amount?.toString() ?? '')
  const [editDate, setEditDate]           = useState('')
  const [section, setSection]             = useState<Section>(null)
  const [loading, setLoading]             = useState(false)
  const [err, setErr]                     = useState<string | null>(null)

  // 予約セクション用
  const { clinics, chainNames, loading: clinicsLoading } = useClinics()
  const [selectedChain, setSelectedChain]   = useState('')
  const [selectedClinic, setSelectedClinic] = useState('')

  const branchesForChain = clinics.filter(c => c.chain_name === selectedChain)

  if (!plan) return null

  const formatted = plan.planned_date.replace(/-/g, '/')

  // 予約済クリニック情報
  const reservedClinic = plan.clinic_id
    ? clinics.find(c => c.id === plan.clinic_id)
    : null

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

  const amount = amountStr !== '' ? parseInt(amountStr, 10) : null

  function handleComplete() {
    if (completedDate !== plan!.planned_date) {
      setSection('weekdayChoice')
    } else {
      run(() => completePlan(plan!, completedDate, undefined, amount))
    }
  }

  function openReserve() {
    setSelectedChain('')
    setSelectedClinic('')
    setSection('reserve')
  }

  function openEditDate() {
    setEditDate(plan!.planned_date)
    setSection('editDate')
  }

  const isActionable = plan.status === 'planned' || plan.status === 'reserved'

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

        {/* 予約済クリニック表示 */}
        {plan.status === 'reserved' && reservedClinic && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-4 text-sm text-rose-800">
            🏥 {reservedClinic.chain_name}　{reservedClinic.branch_name}
          </div>
        )}

        {plan.notes && (
          <p className="text-sm text-gray-500 mb-4 bg-surface rounded-lg px-3 py-2">
            {plan.notes}
          </p>
        )}

        {err && (
          <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">{err}</p>
        )}

        {/* ── 計画中 / 予約済 の操作（メインセクション） ── */}
        {isActionable && section === null && (
          <div className="space-y-3">
            {/* 実施日入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">実施日</label>
              <input
                type="date"
                value={completedDate}
                onChange={e => setCompletedDate(e.target.value)}
                className="w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                次回予定は実施日 + {plan.interval_months}ヶ月で自動更新
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金額（任意）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
                <input
                  type="number"
                  min="0"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="例：15000"
                  className="w-full border border-border-pink rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {/* 予約済にする / 予約取り消し */}
            {plan.status === 'planned' && (
              <button
                onClick={openReserve}
                disabled={loading}
                className="w-full bg-rose-200 text-rose-800 font-medium py-2.5 rounded-lg hover:bg-rose-300 transition-colors disabled:opacity-60"
              >
                予約済にする
              </button>
            )}
            {plan.status === 'reserved' && (
              <button
                onClick={() => run(() => cancelReservation(plan.id))}
                disabled={loading}
                className="w-full border border-rose-200 text-rose-600 font-medium py-2.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-60"
              >
                予約を取り消す
              </button>
            )}

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              実施済みにする
            </button>

            <button
              onClick={() => run(() => skipPlan(plan.id))}
              disabled={loading}
              className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              スキップする
            </button>

            <div className="flex gap-3 pt-1">
              <button
                onClick={openEditDate}
                className="flex-1 text-xs text-gray-400 hover:text-primary transition-colors py-1"
              >
                日程を変更する ›
              </button>
              <button
                onClick={() => setSection('delete')}
                className="flex-1 text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
              >
                削除する ›
              </button>
            </div>
          </div>
        )}

        {/* ── 予約済にするセクション ── */}
        {isActionable && section === 'reserve' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">クリニックを選択</p>
            {clinicsLoading ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : chainNames.length === 0 ? (
              <p className="text-sm text-gray-400 bg-surface rounded-lg px-3 py-3 text-center">
                クリニックが登録されていません。<br />
                <span className="text-xs">凡例の「クリニック管理」から登録してください。</span>
              </p>
            ) : (
              <>
                <select
                  value={selectedChain}
                  onChange={e => { setSelectedChain(e.target.value); setSelectedClinic('') }}
                  className="w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">クリニックを選択...</option>
                  {chainNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                {selectedChain && (
                  <select
                    value={selectedClinic}
                    onChange={e => setSelectedClinic(e.target.value)}
                    className="w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">院を選択...</option>
                    {branchesForChain.map(c => (
                      <option key={c.id} value={c.id}>{c.branch_name}</option>
                    ))}
                  </select>
                )}
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => run(() => reservePlan(plan.id, selectedClinic))}
                disabled={loading || !selectedClinic}
                className="flex-1 bg-rose-200 text-rose-800 font-medium py-2.5 rounded-lg hover:bg-rose-300 transition-colors disabled:opacity-60"
              >
                {loading ? '更新中...' : '予約済にする'}
              </button>
              <button
                onClick={() => setSection(null)}
                className="flex-1 border border-gray-200 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
            </div>
          </div>
        )}

        {/* ── 曜日選択（実施日≠予定日のとき） ── */}
        {isActionable && section === 'weekdayChoice' && (
          <div className="space-y-3">
            <div className="bg-surface rounded-lg px-3 py-2 text-sm text-gray-600 text-center">
              <p>予定日（{weekdayOf(plan.planned_date)}）と異なる日に実施しました。</p>
              <p className="mt-1">今後の計画はどちらの曜日にしますか？</p>
            </div>
            <button
              onClick={() => run(() => completePlan(plan, completedDate, completedDate, amount))}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? '更新中...' : `今後も${weekdayOf(completedDate)}にする（実施日基準）`}
            </button>
            <button
              onClick={() => run(() => completePlan(plan, completedDate, plan.planned_date, amount))}
              disabled={loading}
              className="w-full border border-primary text-primary font-medium py-2.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-60"
            >
              {loading ? '更新中...' : `元の${weekdayOf(plan.planned_date)}に戻す`}
            </button>
            <button
              onClick={() => setSection(null)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              戻る
            </button>
          </div>
        )}

        {/* ── 日程変更フォーム ── */}
        {isActionable && section === 'editDate' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">新しい予定日</label>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => run(() => updatePlanDate(plan.id, editDate))}
                disabled={loading || !editDate}
                className="flex-1 bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {loading ? '更新中...' : '変更する'}
              </button>
              <button
                onClick={() => setSection(null)}
                className="flex-1 border border-gray-200 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
            </div>
          </div>
        )}

        {/* ── 削除セクション ── */}
        {section === 'delete' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center mb-3">削除方法を選んでください</p>
            <button
              onClick={() => run(() => deletePlan(plan.id))}
              disabled={loading}
              className="w-full border border-red-200 text-red-500 text-sm font-medium py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              この計画だけ削除
            </button>
            <button
              onClick={() => run(() => deleteSeriesPlanned(plan.series_id, plan.planned_date))}
              disabled={loading}
              className="w-full border border-red-200 text-red-500 text-sm font-medium py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              以降の計画をすべて削除
              <span className="block text-xs font-normal text-gray-400 mt-0.5">
                実施済みの記録は残ります
              </span>
            </button>
            <button
              onClick={() => setSection(null)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              戻る
            </button>
          </div>
        )}

        {/* ── 実施済み・スキップ済みの表示 ── */}
        {!isActionable && (
          <div className="space-y-3 py-1">
            {plan.status === 'completed' ? (
              <>
                <p className="text-center text-sm text-gray-400">
                  実施日：{plan.completed_date?.replace(/-/g, '/')}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
                      <input
                        type="number"
                        min="0"
                        value={amountStr}
                        onChange={e => setAmountStr(e.target.value)}
                        placeholder="例：15000"
                        className="w-full border border-border-pink rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => run(() => updateAmount(plan.id, amountStr !== '' ? parseInt(amountStr, 10) : null))}
                      disabled={loading}
                      className="shrink-0 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
                    >
                      {loading ? '...' : '保存'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-gray-400">スキップ済み</p>
            )}
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
