import type { PlanStatus } from '@/lib/types'

const config: Record<PlanStatus, { label: string; className: string }> = {
  planned:   { label: '計画中', className: 'bg-sky-100 text-sky-700' },
  completed: { label: '実施済', className: 'bg-rose-400 text-white' },
  skipped:   { label: 'スキップ', className: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }: { status: PlanStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
