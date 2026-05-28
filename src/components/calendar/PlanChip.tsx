import type { MaintenancePlan } from '@/lib/types'

const statusStyle: Record<string, string> = {
  planned:   'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-red-50 text-red-600 border-red-200',
  skipped:   'bg-gray-100 text-gray-400 border-gray-200 line-through',
}

export function PlanChip({ plan }: { plan: MaintenancePlan }) {
  return (
    <div
      className={`text-[10px] leading-4 px-1.5 py-0.5 rounded border truncate ${statusStyle[plan.status]}`}
      title={plan.menu_name}
    >
      {plan.menu_name}
    </div>
  )
}
