import { createClient } from './supabase/client'
import { generateSeriesPlans, calcNextDate, parseDate, formatDate } from './schedule'
import type { NewPlanInput, MaintenancePlan } from './types'

export async function createPlanSeries(input: NewPlanInput): Promise<void> {
  const supabase = createClient()
  const { plans } = generateSeriesPlans(input)

  const { error } = await supabase.from('maintenance_plans').insert(plans)
  if (error) throw new Error(error.message)
}

export async function completePlan(
  plan: MaintenancePlan,
  completedDate: string
): Promise<void> {
  const supabase = createClient()

  // 実施済みに更新
  const { error } = await supabase
    .from('maintenance_plans')
    .update({ status: 'completed', completed_date: completedDate })
    .eq('id', plan.id)
  if (error) throw new Error(error.message)

  // 同シリーズの次の計画を取得
  const { data: nextPlans } = await supabase
    .from('maintenance_plans')
    .select('*')
    .eq('series_id', plan.series_id)
    .eq('status', 'planned')
    .gt('planned_date', plan.planned_date)
    .order('planned_date')
    .limit(1)

  const nextDate = calcNextDate(parseDate(completedDate), plan.interval_months)
  const nextDateStr = formatDate(nextDate)

  if (nextPlans && nextPlans.length > 0) {
    // 次の計画日を実施日ベースで更新
    await supabase
      .from('maintenance_plans')
      .update({ planned_date: nextDateStr })
      .eq('id', nextPlans[0].id)
  } else {
    // 12ヶ月圏外 → 次の計画を新規作成
    await supabase.from('maintenance_plans').insert({
      menu_id: plan.menu_id,
      menu_name: plan.menu_name,
      planned_date: nextDateStr,
      interval_months: plan.interval_months,
      status: 'planned',
      completed_date: null,
      notes: null,
      series_id: plan.series_id,
    })
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
