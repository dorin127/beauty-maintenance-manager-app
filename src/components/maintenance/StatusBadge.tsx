import type { PlanStatus } from '@/lib/types'

const config: Record<PlanStatus, { label: string; className: string }> = {
  planned:   { label: '計画中', className: 'bg-rose-50 text-rose-400 ring-1 ring-rose-200' },
  reserved:  { label: '予約済', className: 'bg-rose-200 text-rose-800' },
  completed: { label: '実施済', className: 'bg-rose-500 text-white' },
  skipped:   { label: 'スキップ', className: 'bg-gray-100 text-gray-500 line-through' },
}

export function StatusBadge({ status, count }: { status: PlanStatus; count?: number }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}{count !== undefined && count > 0 ? ` ${count}件` : ''}
    </span>
  )
}
