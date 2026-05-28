'use client'

import { useState } from 'react'
import { useMenus } from '@/hooks/useMenus'
import { addMenu, deleteMenu } from '@/lib/menuActions'

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

  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [deleteErr, setDeleteErr]     = useState<Record<string, string>>({})

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setAddErr(null)
    try {
      await addMenu({ name: name.trim(), default_interval_months: interval, notes: notes.trim() || undefined })
      setName('')
      setInterval(1)
      setNotes('')
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
      setDeleteErr(prev => ({
        ...prev,
        [menuId]: e instanceof Error ? e.message : '削除に失敗しました',
      }))
    } finally {
      setDeletingId(null)
    }
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
            <ul className="space-y-1.5">
              {menus.map(menu => (
                <li key={menu.id}>
                  <div className="flex items-center justify-between gap-2 bg-surface rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{menu.name}</p>
                      <p className="text-xs text-gray-400">{menu.default_interval_months}ヶ月ごと{menu.notes ? `　${menu.notes}` : ''}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      disabled={deletingId === menu.id}
                      className="shrink-0 text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-1"
                    >
                      {deletingId === menu.id ? '削除中...' : '削除'}
                    </button>
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
              placeholder="例：フォトフェイシャル"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">推奨頻度（ヶ月ごと）</label>
            <input
              type="number"
              min="1"
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
              placeholder="クリニック名など"
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
