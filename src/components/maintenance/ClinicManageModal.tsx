'use client'

import { useState } from 'react'
import { useClinics } from '@/hooks/useClinics'
import { addClinic, deleteClinic } from '@/lib/clinicActions'

const inputClass =
  'w-full border border-border-pink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white'

interface Props {
  onClose: () => void
}

export function ClinicManageModal({ onClose }: Props) {
  const { clinics, chainNames, loading, refetch } = useClinics()

  const [chain, setChain]   = useState('')
  const [branch, setBranch] = useState('')
  const [saving, setSaving] = useState(false)
  const [addErr, setAddErr] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteErr, setDeleteErr]   = useState<Record<string, string>>({})

  // チェーン名ごとにグループ化
  const grouped = chainNames.map(chainName => ({
    chainName,
    branches: clinics.filter(c => c.chain_name === chainName),
  }))

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!chain.trim() || !branch.trim()) return
    setSaving(true)
    setAddErr(null)
    try {
      await addClinic(chain.trim(), branch.trim())
      setBranch('')
      refetch()
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(clinicId: string) {
    setDeletingId(clinicId)
    setDeleteErr(prev => ({ ...prev, [clinicId]: '' }))
    try {
      await deleteClinic(clinicId)
      refetch()
    } catch (e) {
      setDeleteErr(prev => ({
        ...prev,
        [clinicId]: e instanceof Error ? e.message : '削除に失敗しました',
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
          <h3 className="text-lg font-bold text-gray-800">クリニック管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* クリニック一覧 */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">登録済みクリニック</p>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">まだクリニックが登録されていません</p>
          ) : (
            <ul className="space-y-3">
              {grouped.map(({ chainName, branches }) => (
                <li key={chainName}>
                  <p className="text-xs font-semibold text-gray-600 mb-1">{chainName}</p>
                  <ul className="space-y-1 pl-3 border-l-2 border-border-pink">
                    {branches.map(clinic => (
                      <li key={clinic.id}>
                        <div className="flex items-center justify-between gap-2 bg-surface rounded-lg px-3 py-1.5">
                          <span className="text-sm text-gray-700">{clinic.branch_name}</span>
                          <button
                            onClick={() => handleDelete(clinic.id)}
                            disabled={deletingId === clinic.id}
                            className="shrink-0 text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-0.5"
                          >
                            {deletingId === clinic.id ? '削除中...' : '削除'}
                          </button>
                        </div>
                        {deleteErr[clinic.id] && (
                          <p className="text-xs text-red-500 mt-0.5 px-3">{deleteErr[clinic.id]}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 新規追加フォーム */}
        <form onSubmit={handleAdd} className="px-6 pb-6 space-y-3 border-t border-border-pink pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">院を追加</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">クリニック名</label>
            <input
              list="chain-list"
              type="text"
              required
              value={chain}
              onChange={e => setChain(e.target.value)}
              placeholder="例：湘南美容クリニック"
              className={inputClass}
            />
            <datalist id="chain-list">
              {chainNames.map(name => <option key={name} value={name} />)}
            </datalist>
            <p className="text-xs text-gray-400 mt-0.5">既存のクリニック名を選ぶか、新しく入力</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">院名</label>
            <input
              type="text"
              required
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="例：渋谷院"
              className={inputClass}
            />
          </div>

          {addErr && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{addErr}</p>
          )}

          <button
            type="submit"
            disabled={saving || !chain.trim() || !branch.trim()}
            className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm"
          >
            {saving ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>
    </div>
  )
}
