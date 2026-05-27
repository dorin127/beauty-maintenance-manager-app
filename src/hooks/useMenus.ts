'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MaintenanceMenu } from '@/lib/types'

export function useMenus() {
  const [menus, setMenus] = useState<MaintenanceMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

  return { menus, loading, error }
}
