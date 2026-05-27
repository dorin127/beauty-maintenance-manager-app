import type { MaintenancePlan } from '@/lib/types'
import { PlanChip } from './PlanChip'

interface Props {
  year: number
  month: number
  plans: MaintenancePlan[]
  onPlanClick: (plan: MaintenancePlan) => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function CalendarGrid({ year, month, plans, onPlanClick }: Props) {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const plansByDay = plans.reduce<Record<number, MaintenancePlan[]>>((acc, plan) => {
    const day = parseInt(plan.planned_date.split('-')[2])
    if (!acc[day]) acc[day] = []
    acc[day].push(plan)
    return acc
  }, {})

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD
  const isToday = (day: number) =>
    todayStr === `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-[88px] rounded-lg p-1.5 ${
              day !== null
                ? `bg-white border ${isToday(day) ? 'border-primary border-2' : 'border-border-pink'}`
                : ''
            }`}
          >
            {day !== null && (
              <>
                <span
                  className={`text-xs block text-right mb-1 ${
                    idx % 7 === 0
                      ? 'text-red-400'
                      : idx % 7 === 6
                      ? 'text-blue-400'
                      : 'text-gray-600'
                  } ${isToday(day) ? 'font-bold text-primary' : ''}`}
                >
                  {day}
                </span>
                <div className="space-y-0.5">
                  {(plansByDay[day] ?? []).map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => onPlanClick(plan)}
                      className="w-full text-left"
                    >
                      <PlanChip plan={plan} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
