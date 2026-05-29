import { isHoliday } from 'japanese-holidays'
import type { MaintenancePlan } from '@/lib/types'
import { PlanChip } from './PlanChip'

interface Props {
  year: number
  month: number
  plans: MaintenancePlan[]
  onPlanClick: (plan: MaintenancePlan) => void
  onDayClick?: (dateStr: string) => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function CalendarGrid({ year, month, plans, onPlanClick, onDayClick }: Props) {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth  = new Date(year, month, 0).getDate()

  const plansByDay = plans.reduce<Record<number, MaintenancePlan[]>>((acc, plan) => {
    const dateKey = plan.status === 'completed' && plan.completed_date
      ? plan.completed_date
      : plan.planned_date
    const day = parseInt(dateKey.split('-')[2])
    ;(acc[day] ??= []).push(plan)
    return acc
  }, {})

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr   = new Date().toLocaleDateString('sv-SE')
  const isToday    = (day: number) =>
    todayStr === `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dateStr    = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const holidayOf  = (day: number) =>
    isHoliday(new Date(year, month - 1, day))

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
        {cells.map((day, idx) => {
          const holiday = day !== null ? holidayOf(day) : undefined
          const isSun   = idx % 7 === 0
          const isSat   = idx % 7 === 6
          const today   = day !== null && isToday(day)

          return (
            <div
              key={idx}
              onClick={() => day !== null && onDayClick?.(dateStr(day))}
              className={`min-h-[72px] sm:min-h-[88px] rounded-lg p-1 sm:p-1.5 ${
                day !== null
                  ? `bg-white border ${today ? 'border-primary border-2' : holiday ? 'border-red-200' : 'border-border-pink'} ${onDayClick ? 'cursor-pointer hover:border-primary/60 hover:bg-primary-light/30 transition-colors' : ''}`
                  : ''
              }`}
            >
              {day !== null && (
                <>
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-xs font-medium ${
                        today
                          ? 'text-primary font-bold'
                          : isSun || holiday
                          ? 'text-red-400'
                          : isSat
                          ? 'text-blue-400'
                          : 'text-gray-600'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  {holiday && (
                    <p className="hidden sm:block text-[9px] leading-tight text-red-400 truncate mb-0.5">
                      {holiday}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {(plansByDay[day] ?? []).map(plan => (
                      <button
                        key={plan.id}
                        onClick={e => { e.stopPropagation(); onPlanClick(plan) }}
                        className="w-full text-left"
                      >
                        <PlanChip plan={plan} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
