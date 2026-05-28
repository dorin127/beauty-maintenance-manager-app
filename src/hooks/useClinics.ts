'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/lib/types'

export function useClinics() {
  const [clinics, setClinics]   = useState<Clinic[]>([])
  const [loading, setLoading]   = useState(true)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('clinics')
      .select('*')
      .order('chain_name')
      .order('branch_name')
      .then(({ data }) => {
        setClinics(data ?? [])
        setLoading(false)
      })
  }, [revision])

  const chainNames = [...new Set(clinics.map(c => c.chain_name))]

  return { clinics, chainNames, loading, refetch: () => setRevision(r => r + 1) }
}
