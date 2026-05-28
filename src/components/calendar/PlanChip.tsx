import type { MaintenancePlan } from '@/lib/types'

const statusStyle: Record<string, string> = {
  planned:   'bg-sky-100 text-sky-700 border-sky-200',
  completed: 'bg-rose-400 text-white border-rose-300',
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
