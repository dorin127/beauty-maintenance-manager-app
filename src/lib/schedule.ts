import type { NewPlanInput } from './types'

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/** カットオフ計算用（月末丸め付き） */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const day = result.getDate()
  result.setMonth(result.getMonth() + months)
  if (result.getDate() !== day) result.setDate(0)
  return result
}

/**
 * 「同じ曜日・同じ月内ポジション」で months ヶ月後の日付を返す。
 *
 * base が「その月の最後の○曜日」→ 対象月の最後の○曜日
 * base が「第N○曜日」（N=1〜4）→ 対象月の第N○曜日
 *
 * 同月2回施術を防ぐため、「第5○曜日」は「最後の○曜日」として扱う。
 */
export function calcNextWeekdayAligned(base: Date, months: number): Date {
  const weekday = base.getDay()

  // base がその月の最後の○曜日か判定
  const oneWeekLater = new Date(base)
  oneWeekLater.setDate(base.getDate() + 7)
  const isLastOccurrence = oneWeekLater.getMonth() !== base.getMonth()

  // 第何○曜日か（1-based、最大5）
  const nthOccurrence = Math.ceil(base.getDate() / 7)

  // 対象年月（0-based month）
  let y = base.getFullYear()
  let m = base.getMonth() + months
  y += Math.floor(m / 12)
  m = ((m % 12) + 12) % 12

  if (isLastOccurrence || nthOccurrence >= 5) {
    // 対象月の最後の○曜日
    const last = new Date(y, m + 1, 0) // 月末日
    while (last.getDay() !== weekday) last.setDate(last.getDate() - 1)
    return last
  } else {
    // 対象月の第N○曜日
    const firstOfMonth = new Date(y, m, 1)
    const firstWeekday = firstOfMonth.getDay()
    let targetDay = 1 + ((weekday - firstWeekday + 7) % 7) + (nthOccurrence - 1) * 7

    // 念のため月内に収まらない場合は1週前（実際には4以下では発生しない）
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    if (targetDay > daysInMonth) targetDay -= 7

    return new Date(y, m, targetDay)
  }
}

type PlanRow = {
  menu_id: string
  menu_name: string
  planned_date: string
  interval_months: number
  notes: string | null
  series_id: string
  status: 'planned'
  completed_date: null
}

/**
 * 初回日付から12ヶ月先まで繰り返し計画を生成する。
 * 各日付は開始日から step×interval_months の曜日揃え計算で求める（ドリフト防止）。
 */
export function generateSeriesPlans(input: NewPlanInput, seriesId?: string) {
  const sid = seriesId ?? crypto.randomUUID()
  const cutoff = addMonths(new Date(), 12)
  const plans: PlanRow[] = []
  const startDate = parseDate(input.planned_date)

  let step = 0
  let current = startDate

  while (current <= cutoff) {
    plans.push({
      menu_id:         input.menu_id,
      menu_name:       input.menu_name,
      planned_date:    formatDate(current),
      interval_months: input.interval_months,
      notes:           input.notes ?? null,
      series_id:       sid,
      status:          'planned',
      completed_date:  null,
    })
    step++
    current = calcNextWeekdayAligned(startDate, input.interval_months * step)
  }

  return { plans, seriesId: sid }
}

/**
 * 実施完了時に次回日程を計算する。
 * 実施日の曜日・月内ポジションを揃えて返す。
 */
export function calcNextDate(completedDate: Date, intervalMonths: number): Date {
  return calcNextWeekdayAligned(completedDate, intervalMonths)
}
