export type PlanStatus = 'planned' | 'reserved' | 'completed' | 'skipped'

export interface Caution {
  menu_name: string
  wait_months: number
  reason: string
}

export interface MaintenanceMenu {
  id: string
  name: string
  default_interval_months: number
  cautions: Caution[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  chain_name: string
  branch_name: string
  created_at: string
  updated_at: string
}

export interface MaintenancePlan {
  id: string
  menu_id: string | null
  menu_name: string
  planned_date: string        // YYYY-MM-DD
  interval_months: number
  status: PlanStatus
  completed_date: string | null
  amount: number | null
  body_part: string | null
  units: number | null
  clinic_id: string | null
  notes: string | null
  series_id: string
  created_at: string
  updated_at: string
}

export interface NewPlanInput {
  menu_id: string
  menu_name: string
  planned_date: string
  interval_months: number
  body_part?: string
  units?: number
  notes?: string
}
