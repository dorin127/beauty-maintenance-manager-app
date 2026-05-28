'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MaintenanceMenu } from '@/lib/types'

export function useMenus() {
  const [menus, setMenus]   = useState<MaintenanceMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('maintenance_menus')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setMenus(data ?? [])
        setLoading(false)
      })
  }, [revision])

  return { menus, loading, error, refetch: () => setRevision(r => r + 1) }
}
