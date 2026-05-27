import type { MaintenancePlan } from '@/lib/types'

const statusStyle: Record<string, string> = {
  planned:   'bg-primary-light text-primary border-primary/30',
  completed: 'bg-green-50 text-green-700 border-green-200',
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
