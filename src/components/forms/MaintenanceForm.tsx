'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMenus } from '@/hooks/useMenus'
import { createPlanSeries } from '@/lib/planActions'
import type { MaintenanceMenu } from '@/lib/types'

const inputClass =
  'w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white'

export function MaintenanceForm() {
  const router = useRouter()
  const { menus, loading: menusLoading } = useMenus()

  const [selectedMenu, setSelectedMenu] = useState<MaintenanceMenu | null>(null)
  const [plannedDate, setPlannedDate] = useState(new Date().toLocaleDateString('sv-SE'))
  const [intervalMonths, setIntervalMonths] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleMenuChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const menu = menus.find(m => m.id === e.target.value) ?? null
    setSelectedMenu(menu)
    if (menu) setIntervalMonths(menu.default_interval_months)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMenu) return

    setLoading(true)
    setError(null)
    try {
      await createPlanSeries({
        menu_id: selectedMenu.id,
        menu_name: selectedMenu.name,
        planned_date: plannedDate,
        interval_months: intervalMonths,
        notes: notes || undefined,
      })
      setSuccess(true)
      setTimeout(() => router.push('/monthly'), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-border-pink p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <p className="font-medium text-gray-800 mb-1">計画を保存しました</p>
        <p className="text-sm text-gray-400">月間カレンダーへ移動します...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border-pink p-6 space-y-5">

      {/* メニュー選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メンテメニュー</label>
        {menusLoading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <select name="menu_id" required onChange={handleMenuChange} className={inputClass}>
            <option value="">選択してください</option>
            {menus.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}
        {selectedMenu?.prohibited_with && selectedMenu.prohibited_with.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠ 同日禁止：{selectedMenu.prohibited_with.join('・')}
          </p>
        )}
        {selectedMenu?.notes && (
          <p className="text-xs text-gray-400 mt-1">{selectedMenu.notes}</p>
        )}
      </div>

      {/* 初回日付 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">初回日付</label>
        <input
          type="date"
          required
          value={plannedDate}
          onChange={e => setPlannedDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* 頻度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          頻度（ヶ月ごと）
          {selectedMenu && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              推奨：{selectedMenu.default_interval_months}ヶ月
            </span>
          )}
        </label>
        <input
          type="number"
          min="1"
          max="24"
          required
          value={intervalMonths}
          onChange={e => setIntervalMonths(Number(e.target.value))}
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          初回日から1年分（最大）の計画を自動生成します
        </p>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="クリニック名・担当者など"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || menusLoading}
        className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading ? '保存中...' : '1年分の計画を保存する'}
      </button>
    </form>
  )
}
