import type { MaintenancePlan } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

function formatJpDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function PlanCard({ plan }: { plan: MaintenancePlan }) {
  return (
    <div className="bg-white rounded-xl border border-border-pink p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
      <div className="space-y-0.5">
        <p className="font-medium text-gray-800">{plan.menu_name}</p>
        <p className="text-sm text-gray-500">{formatJpDate(plan.planned_date)}</p>
        {plan.notes && <p className="text-xs text-gray-400">{plan.notes}</p>}
      </div>
      <StatusBadge status={plan.status} />
    </div>
  )
}
