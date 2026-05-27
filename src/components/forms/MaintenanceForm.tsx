'use client'

import { useState } from 'react'

const inputClass =
  'w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

export function MaintenanceForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // TODO: Supabase への保存 + generateSeriesPlans() を呼び出す
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-border-pink p-6 space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メンテメニュー</label>
        <select name="menu_id" required className={inputClass}>
          <option value="">選択してください</option>
          {/* TODO: maintenance_menus から動的に生成 */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">初回日付</label>
        <input name="planned_date" type="date" required className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          頻度（ヶ月ごと）
        </label>
        <input
          name="interval_months"
          type="number"
          min="1"
          max="24"
          defaultValue={1}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
        <textarea name="notes" rows={3} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading ? '保存中...' : '保存する'}
      </button>
    </form>
  )
}
