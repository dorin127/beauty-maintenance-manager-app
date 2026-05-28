export type PlanStatus = 'planned' | 'reserved' | 'completed' | 'skipped'

export interface MaintenanceMenu {
  id: string
  name: string
  default_interval_months: number
  prohibited_with: string[]
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
  notes?: string
}
