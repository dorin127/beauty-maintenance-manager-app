'use client'

import { useState } from 'react'
import { useMenus } from '@/hooks/useMenus'
import { addMenu, deleteMenu, updateCautions } from '@/lib/menuActions'
import type { Caution } from '@/lib/types'

const inputClass =
  'w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white'

interface Props {
  onClose: () => void
}

export function MenuManageModal({ onClose }: Props) {
  const { menus, loading, refetch } = useMenus()

  const [name, setName]         = useState('')
  const [interval, setInterval] = useState(1)
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [addErr, setAddErr]     = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteErr, setDeleteErr]   = useState<Record<string, string>>({})

  // 禁忌設定
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [cautionMenuName, setCautionMenuName] = useState('')
  const [cautionMonths, setCautionMonths]     = useState(1)
  const [cautionReason, setCautionReason]     = useState('')
  const [cautionSaving, setCautionSaving]     = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setAddErr(null)
    try {
      await addMenu({ name: name.trim(), default_interval_months: interval, notes: notes.trim() || undefined })
      setName(''); setInterval(1); setNotes('')
      refetch()
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(menuId: string) {
    setDeletingId(menuId)
    setDeleteErr(prev => ({ ...prev, [menuId]: '' }))
    try {
      await deleteMenu(menuId)
      refetch()
    } catch (e) {
      setDeleteErr(prev => ({ ...prev, [menuId]: e instanceof Error ? e.message : '削除に失敗しました' }))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleAddCaution(menuId: string, current: Caution[]) {
    if (!cautionMenuName || !cautionReason.trim()) return
    setCautionSaving(true)
    try {
      const updated: Caution[] = [
        ...current,
        { menu_name: cautionMenuName, wait_months: cautionMonths, reason: cautionReason.trim() },
      ]
      await updateCautions(menuId, updated)
      setCautionMenuName(''); setCautionMonths(1); setCautionReason('')
      refetch()
    } finally {
      setCautionSaving(false)
    }
  }

  async function handleDeleteCaution(menuId: string, current: Caution[], index: number) {
    const updated = current.filter((_, i) => i !== index)
    await updateCautions(menuId, updated)
    refetch()
  }

  function toggleExpand(menuId: string) {
    setExpandedId(prev => prev === menuId ? null : menuId)
    setCautionMenuName(''); setCautionMonths(1); setCautionReason('')
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border-pink">
          <h3 className="text-lg font-bold text-gray-800">メンテメニュー管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* メニュー一覧 */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">登録済みメニュー</p>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">まだメニューがありません</p>
          ) : (
            <ul className="space-y-2">
              {menus.map(menu => (
                <li key={menu.id}>
                  <div className="bg-surface rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{menu.name}</p>
                        <p className="text-xs text-gray-400">{menu.default_interval_months === 0 ? '定期なし' : `${menu.default_interval_months}ヶ月ごと`}{menu.notes ? `　${menu.notes}` : ''}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => toggleExpand(menu.id)}
                          className="text-xs text-gray-400 hover:text-primary transition-colors px-2 py-1"
                        >
                          禁忌 ›
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          disabled={deletingId === menu.id}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-1"
                        >
                          {deletingId === menu.id ? '削除中' : '削除'}
                        </button>
                      </div>
                    </div>

                    {/* 禁忌設定パネル */}
                    {expandedId === menu.id && (
                      <div className="mt-3 pt-3 border-t border-border-pink space-y-2">
                        <p className="text-xs font-semibold text-gray-500">施術後の禁忌メニューを設定</p>

                        {menu.cautions.length === 0 ? (
                          <p className="text-xs text-gray-400">禁忌なし</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {menu.cautions.map((c, i) => (
                              <li key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 flex items-start justify-between gap-2">
                                <div className="text-xs">
                                  <span className="font-medium text-amber-800">{c.menu_name}</span>
                                  <span className="text-amber-600 ml-1">→ {c.wait_months}ヶ月間禁忌</span>
                                  <p className="text-amber-700 mt-0.5">{c.reason}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteCaution(menu.id, menu.cautions, i)}
                                  className="shrink-0 text-xs text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  ✕
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* 禁忌追加フォーム */}
                        <div className="space-y-1.5 pt-1">
                          <select
                            value={cautionMenuName}
                            onChange={e => setCautionMenuName(e.target.value)}
                            className="w-full border border-border-pink rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          >
                            <option value="">対象メニューを選択...</option>
                            {menus.filter(m => m.id !== menu.id && !menu.cautions.some(c => c.menu_name === m.name)).map(m => (
                              <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                          </select>
                          <div className="flex gap-1.5">
                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min="1"
                                max="6"
                                value={cautionMonths}
                                onChange={e => setCautionMonths(Number(e.target.value))}
                                className="w-12 border border-border-pink rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white text-center"
                              />
                              <span className="text-xs text-gray-500 whitespace-nowrap">ヶ月間禁忌</span>
                            </div>
                            <input
                              type="text"
                              value={cautionReason}
                              onChange={e => setCautionReason(e.target.value)}
                              placeholder="理由"
                              className="flex-1 border border-border-pink rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            />
                          </div>
                          <button
                            onClick={() => handleAddCaution(menu.id, menu.cautions)}
                            disabled={cautionSaving || !cautionMenuName || !cautionReason.trim()}
                            className="w-full bg-amber-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                          >
                            {cautionSaving ? '追加中...' : '禁忌を追加'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {deleteErr[menu.id] && (
                    <p className="text-xs text-red-500 mt-1 px-3">{deleteErr[menu.id]}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 新規追加フォーム */}
        <form onSubmit={handleAdd} className="px-6 pb-6 space-y-3 border-t border-border-pink pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">新しいメニューを追加</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メニュー名</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：水光注射"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">推奨頻度（ヶ月ごと・定期なしは0）</label>
            <input
              type="number"
              min="0"
              max="24"
              required
              value={interval}
              onChange={e => setInterval(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メモ（任意）</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="例：2週間に1回など"
              className={inputClass}
            />
          </div>

          {addErr && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{addErr}</p>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm"
          >
            {saving ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>
    </div>
  )
}
