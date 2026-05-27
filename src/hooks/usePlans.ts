'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MaintenancePlan } from '@/lib/types'

export function useMonthlyPlans(year: number, month: number) {
  const [plans, setPlans] = useState<MaintenancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const m = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    const startDate = `${year}-${m}-01`
    const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`

    setLoading(true)
    const supabase = createClient()
    supabase
      .from('maintenance_plans')
      .select('*')
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
      .order('planned_date')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPlans(data ?? [])
        setLoading(false)
      })
  }, [year, month, revision])

  const refetch = () => setRevision(r => r + 1)
  return { plans, loading, error, refetch }
}

export function useAnnualPlans(year: number) {
  const [plans, setPlans] = useState<MaintenancePlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('maintenance_plans')
      .select('*')
      .gte('planned_date', `${year}-01-01`)
      .lte('planned_date', `${year}-12-31`)
      .order('planned_date')
      .then(({ data }) => {
        setPlans(data ?? [])
        setLoading(false)
      })
  }, [year])

  return { plans, loading }
}
