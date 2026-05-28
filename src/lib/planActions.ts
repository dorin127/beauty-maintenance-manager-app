import { createClient } from './supabase/client'
import { generateSeriesPlans, calcNextWeekdayAligned, addMonths, parseDate, formatDate } from './schedule'
import type { NewPlanInput, MaintenancePlan } from './types'

type PlanInsert = {
  menu_id: string | null
  menu_name: string
  planned_date: string
  interval_months: number
  status: 'planned'
  completed_date: null
  notes: string | null
  series_id: string
}

export async function createPlanSeries(input: NewPlanInput): Promise<void> {
  const supabase = createClient()
  const { plans } = generateSeriesPlans(input)

  const { error } = await supabase.from('maintenance_plans').insert(plans)
  if (error) throw new Error(error.message)
}

/**
 * 実施済みにする。
 * - planned_date を実施日に更新（カレンダー上の表示を実際の日付へ移動）
 * - 以降の計画を baseForFuture の曜日・位置で再生成する
 * @param baseForFuture 未指定なら completedDate（実施日基準）。
 *                      plan.planned_date を渡すと元の曜日基準で再生成。
 */
export async function completePlan(
  plan: MaintenancePlan,
  completedDate: string,
  baseForFuture?: string
): Promise<void> {
  const supabase = createClient()
  const originalPlannedDate = plan.planned_date
  const base = baseForFuture ?? completedDate

  // 1. 現在の計画を実施済みに更新（planned_date も実施日へ移動）
  const { error } = await supabase
    .from('maintenance_plans')
    .update({ status: 'completed', completed_date: completedDate, planned_date: completedDate })
    .eq('id', plan.id)
  if (error) throw new Error(error.message)

  // 2. 同シリーズの以降の計画をすべて削除（元の planned_date より後）
  const { error: delErr } = await supabase
    .from('maintenance_plans')
    .delete()
    .eq('series_id', plan.series_id)
    .eq('status', 'planned')
    .gt('planned_date', originalPlannedDate)
  if (delErr) throw new Error(delErr.message)

  // 3. base 日付から12ヶ月先まで再生成
  const cutoff   = addMonths(new Date(), 12)
  const baseDate = parseDate(base)
  const newPlans: PlanInsert[] = []

  let step = 1
  let next = calcNextWeekdayAligned(baseDate, plan.interval_months * step)
  while (next <= cutoff) {
    newPlans.push({
      menu_id:         plan.menu_id,
      menu_name:       plan.menu_name,
      planned_date:    formatDate(next),
      interval_months: plan.interval_months,
      status:          'planned',
      completed_date:  null,
      notes:           plan.notes ?? null,
      series_id:       plan.series_id,
    })
    step++
    next = calcNextWeekdayAligned(baseDate, plan.interval_months * step)
  }

  if (newPlans.length > 0) {
    const { error: insErr } = await supabase.from('maintenance_plans').insert(newPlans)
    if (insErr) throw new Error(insErr.message)
  }
}

export async function skipPlan(planId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('maintenance_plans')
    .update({ status: 'skipped' })
    .eq('id', planId)
  if (error) throw new Error(error.message)
}

/** 計画中の予定日を変更 */
export async function updatePlanDate(planId: string, newDate: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('maintenance_plans')
    .update({ planned_date: newDate })
    .eq('id', planId)
    .eq('status', 'planned')
  if (error) throw new Error(error.message)
}

/** この計画1件だけ削除 */
export async function deletePlan(planId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('maintenance_plans')
    .delete()
    .eq('id', planId)
  if (error) throw new Error(error.message)
}

/** 同じシリーズの「計画中」の全件を削除（実施済み履歴は残す） */
export async function deleteSeriesPlanned(
  seriesId: string,
  fromDate: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('maintenance_plans')
    .delete()
    .eq('series_id', seriesId)
    .eq('status', 'planned')
    .gte('planned_date', fromDate)
  if (error) throw new Error(error.message)
}
