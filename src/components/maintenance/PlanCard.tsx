import type { MaintenancePlan } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

function formatJpDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function PlanCard({
  plan,
  onClick,
}: {
  plan: MaintenancePlan
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={`bg-white rounded-xl border border-border-pink p-4 flex items-center justify-between
        ${onClick ? 'cursor-pointer hover:shadow-sm hover:border-primary/40 transition-all' : ''}`}
    >
      <div className="space-y-0.5">
        <p className="font-medium text-gray-800">{plan.menu_name}</p>
        <p className="text-sm text-gray-500">{formatJpDate(plan.planned_date)}</p>
        {plan.notes && (
          <p className="text-xs text-gray-400 truncate max-w-xs">{plan.notes}</p>
        )}
      </div>
      <StatusBadge status={plan.status} />
    </div>
  )
}
