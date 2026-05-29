'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMenus } from '@/hooks/useMenus'
import { createPlanSeries } from '@/lib/planActions'
import { createClient } from '@/lib/supabase/client'
import type { MaintenanceMenu } from '@/lib/types'

const inputClass =
  'w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white'

interface Props {
  initialDate?: string
  onSuccess?: () => void
}

type ConflictPlan = { menu_name: string; planned_date: string; reason: string; wait_months: number }

function shiftMonth(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function MaintenanceForm({ initialDate, onSuccess }: Props) {
  const router = useRouter()
  const { menus, loading: menusLoading } = useMenus()

  const [selectedMenu, setSelectedMenu] = useState<MaintenanceMenu | null>(null)
  const [plannedDate, setPlannedDate] = useState(initialDate ?? new Date().toLocaleDateString('sv-SE'))
  const [intervalMonths, setIntervalMonths] = useState(1)
  const [bodyPart, setBodyPart] = useState('')
  const [unitsStr, setUnitsStr] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflictWarning, setConflictWarning] = useState<ConflictPlan[] | null>(null)

  function handleMenuChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const menu = menus.find(m => m.id === e.target.value) ?? null
    setSelectedMenu(menu)
    if (menu) setIntervalMonths(menu.default_interval_months)
    setConflictWarning(null)
  }

  async function save() {
    if (!selectedMenu) return
    setLoading(true)
    setError(null)
    try {
      await createPlanSeries({
        menu_id: selectedMenu.id,
        menu_name: selectedMenu.name,
        planned_date: plannedDate,
        interval_months: intervalMonths,
        body_part: bodyPart || undefined,
        units: unitsStr ? parseInt(unitsStr, 10) : undefined,
        notes: notes || undefined,
      })
      if (onSuccess) {
        onSuccess()
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/monthly'), 1500)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMenu) return

    setLoading(true)
    const supabase = createClient()
    // cautions の最大待機期間まで検索範囲を広げる
    const maxWait = selectedMenu.cautions.length > 0
      ? Math.max(...selectedMenu.cautions.map(c => c.wait_months))
      : 1
    const { data: nearbyPlans } = await supabase
      .from('maintenance_plans')
      .select('menu_name, planned_date')
      .gte('planned_date', shiftMonth(plannedDate, -maxWait))
      .lte('planned_date', shiftMonth(plannedDate, maxWait))
      .neq('status', 'skipped')
    setLoading(false)

    const conflicts: ConflictPlan[] = []
    const seen = new Set<string>()
    for (const nearby of nearbyPlans ?? []) {
      const key = `${nearby.menu_name}|${nearby.planned_date}`
      if (seen.has(key)) continue

      // 新メニュー → 既存（新メニューが先になる場合）: 新メニューの cautions をチェック
      if (nearby.planned_date >= plannedDate) {
        const caution = selectedMenu.cautions.find(c => c.menu_name === nearby.menu_name)
        if (caution && nearby.planned_date <= shiftMonth(plannedDate, caution.wait_months)) {
          conflicts.push({ menu_name: nearby.menu_name, planned_date: nearby.planned_date, reason: caution.reason, wait_months: caution.wait_months })
          seen.add(key)
          continue
        }
      }

      // 既存 → 新メニュー（既存が先になる場合）: 既存メニューの cautions をチェック
      if (nearby.planned_date <= plannedDate) {
        const nearbyDef = menus.find(m => m.name === nearby.menu_name)
        const caution = nearbyDef?.cautions.find(c => c.menu_name === selectedMenu.name)
        if (caution && plannedDate <= shiftMonth(nearby.planned_date, caution.wait_months)) {
          conflicts.push({ menu_name: nearby.menu_name, planned_date: nearby.planned_date, reason: caution.reason, wait_months: caution.wait_months })
          seen.add(key)
        }
      }
    }

    if (conflicts.length > 0) {
      setConflictWarning(conflicts)
      return
    }

    await save()
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
          onChange={e => { setPlannedDate(e.target.value); setConflictWarning(null) }}
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
          min="0"
          max="24"
          required
          value={intervalMonths}
          onChange={e => setIntervalMonths(Number(e.target.value))}
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          {intervalMonths === 0 ? '0 = 定期なし。1件のみ作成します。' : '初回日から1年分（最大）の計画を自動生成します'}
        </p>
      </div>

      {/* 部位・単位数 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">部位（任意）</label>
          <input
            type="text"
            value={bodyPart}
            onChange={e => setBodyPart(e.target.value)}
            placeholder="例：額、目尻"
            className={inputClass}
          />
        </div>
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-700 mb-1">単位数（任意）</label>
          <input
            type="number"
            min="0"
            value={unitsStr}
            onChange={e => setUnitsStr(e.target.value)}
            placeholder="例：20"
            className={inputClass}
          />
        </div>
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

      {/* 非推奨警告 */}
      {conflictWarning ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">推奨されない組み合わせです</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            以下の施術が1ヶ月以内に予定・実施されています。組み合わせによっては効果の低下や肌への負担が生じる場合があります。
          </p>
          <ul className="text-xs text-amber-800 space-y-2">
            {conflictWarning.map((c, i) => (
              <li key={i} className="bg-white/60 rounded-lg px-2.5 py-1.5">
                <span className="font-medium">{c.menu_name}</span>
                <span className="text-amber-600">（{c.planned_date.slice(5).replace('-', '/')}）</span>
                <span className="ml-1 text-xs text-amber-500">→ {c.wait_months}ヶ月あけることを推奨</span>
                <p className="text-amber-700 mt-0.5">{c.reason}</p>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConflictWarning(null)}
              className="flex-1 border border-amber-300 text-amber-700 text-sm font-medium py-2.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="flex-1 bg-amber-500 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {loading ? '保存中...' : '理解した上で設定する'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading || menusLoading}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? '確認中...' : intervalMonths === 0 ? '計画を保存する' : '1年分の計画を保存する'}
        </button>
      )}
    </form>
  )
}
