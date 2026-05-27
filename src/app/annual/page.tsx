import { Suspense } from 'react'
import { AnnualView } from '@/components/calendar/AnnualView'

export default function AnnualPage() {
  return (
    <Suspense>
      <AnnualView />
    </Suspense>
  )
}
