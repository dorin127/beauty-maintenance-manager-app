import type { MaintenancePlan } from '@/lib/types'

const statusStyle: Record<string, string> = {
  planned:   'bg-rose-50 text-rose-400 border-rose-200',
  reserved:  'bg-rose-200 text-rose-800 border-rose-300',
  completed: 'bg-rose-500 text-white border-rose-500',
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
