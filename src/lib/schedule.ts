import type { NewPlanInput } from './types'

/** 月末オーバーフローを考慮した月加算（例: 1/31 + 1ヶ月 = 2/28） */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const day = result.getDate()
  result.setMonth(result.getMonth() + months)
  if (result.getDate() !== day) {
    result.setDate(0) // 月末に丸める
  }
  return result
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
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
 * 初回日付から12ヶ月先まで、繰り返し計画を生成する。
 * 生成した計画群は同一の series_id を持つ。
 */
export function generateSeriesPlans(input: NewPlanInput, seriesId?: string) {
  const sid = seriesId ?? crypto.randomUUID()
  const cutoff = addMonths(new Date(), 12)
  const plans: PlanRow[] = []
  let current = parseDate(input.planned_date)

  while (current <= cutoff) {
    plans.push({
      menu_id: input.menu_id,
      menu_name: input.menu_name,
      planned_date: formatDate(current),
      interval_months: input.interval_months,
      notes: input.notes ?? null,
      series_id: sid,
      status: 'planned',
      completed_date: null,
    })
    current = addMonths(current, input.interval_months)
  }

  return { plans, seriesId: sid }
}

/**
 * 実施完了時に呼ぶ。completedDate + interval_months で次の予定日を返す。
 * シリーズ内の将来計画をこの日付を起点に再計算する際に使用する。
 */
export function calcNextDate(completedDate: Date, intervalMonths: number): Date {
  return addMonths(completedDate, intervalMonths)
}
